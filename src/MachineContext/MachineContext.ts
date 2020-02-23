import { IMachineContext } from '../IMachineContext';
import { IMachineContextController } from '../IMachineContextController';
import {
    MachineBlueprint,
    StateExitFn,
} from '../types';

export class MachineContext<T extends string> implements IMachineContextController<T> {

    private machineId: number;
    private blueprint: MachineBlueprint<T>;
    private onExitFns: StateExitFn[] = [];

    constructor(
        private readonly onEnd?: StateExitFn,
    ) { }

    transitionToState(state: T | 'end'): void {
        if (!this.blueprint) {
            throw new Error(
                'This MachineContext is not currently servicing a machine. ' +
                'Are you attempting to transition a machine after it has been terminated?'
            );
        }

        this.cleanupState();

        if (state === 'end') {
            this.cleanupMachine();
        } else {
            this.initializeState(state);
        }
    }

    serviceMachine<J extends string>(
        blueprint: MachineBlueprint<J>,
        machineId: number,
    ): IMachineContextController<J> {
        if (this.blueprint) {
            throw new Error(
                'This MachineContext is currently in use. ' +
                'Please terminate the current machine before attempting to service a new machine.'
            );
        }
        this.blueprint = blueprint as unknown as MachineBlueprint<T>;
        this.machineId = machineId;
        this.initializeState(this.blueprint.initState);
        return this as unknown as MachineContext<J>;
    }

    isInService(): boolean {
        return this.blueprint !== undefined;
    }

    get id(): number {
        if (!this.machineId) {
            throw new Error(
                'This MachineContext is not currently servicing a machine. ' +
                'Are you attempting to transition a machine after it has been terminated?'
            );
        }

        return this.machineId;
    }

    private initializeState(state: T): void {
        const runFns = [];
        const cleanupFns = [];

        for (let setupFn of this.blueprint.states[state]) {
            const { onRun, onExit } = setupFn(this);
            onRun && runFns.push(onRun);
            onExit && cleanupFns.push(onExit);
        }

        this.onExitFns = cleanupFns;

        for (let run of runFns) {
            run(this.machineId);
        }
    }

    private cleanupState(): void {
        for (let onExit of this.onExitFns) {
            onExit(this.machineId);
        }
        this.onExitFns = [];
    }

    private cleanupMachine(): void {
        const { machineId } = this;

        for (let onEndFn of this.blueprint.onEnd || []) {
            onEndFn(this.machineId);
        }

        delete this.machineId;
        delete this.blueprint;

        this.onEnd && this.onEnd(machineId);
    }
}
