import { IMachine } from '../IMachine';
import { IMachineSPI } from '../IMachineSPI';
import {
    MachineBlueprint,
    StateExitFn,
    MachineTerminateFn,
} from '../types';

class MachineSPI<T extends string> implements IMachineSPI<T> {
    constructor(
        private machine: IMachine<T>,
        private transitionToStateFn: (state: T | "end") => void,
    ) { }

    transitionToState(state: T | "end"): void {
        return this.transitionToStateFn(state);
    }

    terminate(): void {
        return this.machine.terminate();
    }

    get id(): number {
        return this.machine.id;
    }
}

export class Machine<T extends string> implements IMachine<T> {

    private readonly onEnd?: MachineTerminateFn;
    private machineId: number;
    private blueprint: MachineBlueprint<T>;
    private onExitFns: StateExitFn<T>[] = [];
    private machineSPI: IMachineSPI<T>;

    constructor(onEnd?: MachineTerminateFn) {
        this.onEnd = onEnd;
        this.machineSPI = new MachineSPI(this, this.transitionToState.bind(this));
    }


    init<J extends string>(
        blueprint: MachineBlueprint<J>,
        machineId: number,
    ): IMachine<J> {
        if (this.blueprint) {
            throw new Error(
                'This MachineContext is currently in use. ' +
                'Please terminate the current machine before ' +
                'attempting to service a new machine.'
            );
        }
        this.blueprint = blueprint as unknown as MachineBlueprint<T>;
        this.machineId = machineId;
        this.initializeState(this.blueprint.initState);
        return this as unknown as Machine<J>;
    }


    terminate(): void {
        this.cleanupState();
        this.runOnEndFns();

        const { machineId } = this;
        delete this.machineId;
        delete this.blueprint;
        // Hack. This needs to be fixed.
        this.onEnd && this.onEnd({ id: machineId });
    }


    isInitialized(): boolean {
        return this.blueprint !== undefined;
    }


    get id(): number {
        if (!this.machineId) {
            throw new Error(
                'This MachineContext is not currently servicing a machine. ' +
                'Are you attempting to transition a machine after it has ' +
                'been terminated?'
            );
        }

        return this.machineId;
    }


    private transitionToState(state: T | 'end'): void {
        if (!this.blueprint) {
            throw new Error(
                'This MachineContext is not currently servicing a machine. ' +
                'Are you attempting to transition a machine after it has ' +
                'been terminated?'
            );
        }

        if (state === 'end') {
            return this.terminate();
        }

        this.cleanupState();
        this.initializeState(state);
    }


    private initializeState(state: T): void {
        const runFns = [];
        const cleanupFns = [];

        for (let setupFn of this.blueprint.states[state]) {
            const { onRun, onExit } = setupFn(this.machineSPI);
            onRun && runFns.push(onRun);
            onExit && cleanupFns.push(onExit);
        }

        this.onExitFns = cleanupFns;

        for (let run of runFns) {
            run(this.machineSPI);
        }
    }


    private cleanupState(): void {
        for (let onExit of this.onExitFns) {
            onExit(this.machineSPI);
        }
        this.onExitFns = [];
    }


    private runOnEndFns(): void {
        const { machineId } = this;
        for (let onEndFn of this.blueprint.onEnd || []) {
            onEndFn({ id: machineId });
        }
    }
}
