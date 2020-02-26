import { IMachine } from '../IMachine';
import { IMachineSPI } from '../IMachineSPI';
import {
    MachineBlueprint,
    StateExitFn,
    MachineTerminateFn,
} from '../types';


export class MachineCore<S extends string, D>
    implements IMachine<D>, IMachineSPI<S, D> {

    private readonly onEnd?: MachineTerminateFn<D>;
    private auxData?: D;
    private blueprint: MachineBlueprint<S, D>;
    private onExitFns: StateExitFn<S, D>[] = [];


    constructor(onEnd?: MachineTerminateFn<D>) {
        this.onEnd = onEnd;
    }


    init<J extends string>(
        blueprint: MachineBlueprint<J, D>,
        auxData?: D,
    ): void {
        if (this.blueprint) {
            throw new Error(
                'This MachineContext is currently in use. ' +
                'Please terminate the current machine before ' +
                'attempting to service a new machine.'
            );
        }
        this.blueprint = blueprint as unknown as MachineBlueprint<S, D>;
        this.auxData = auxData;
        this.initializeState(this.blueprint.initState);
    }


    terminate(): void {
        this.cleanupState();
        this.runOnEndFns();

        this.onEnd && this.onEnd(this);

        delete this.blueprint;
        delete this.auxData;
    }


    isInitialized(): boolean {
        return this.blueprint !== undefined;
    }


    getAuxillaryData(): D | undefined {
        return this.auxData;
    }


    setAuxillaryData(data: D): void {
        this.auxData = data;
    }


    transitionToState(state: S | 'end'): void {
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


    private initializeState(state: S): void {
        const runFns = [];
        const cleanupFns = [];

        for (let setupFn of this.blueprint.states[state]) {
            const { onRun, onExit } = setupFn(this);
            onRun && runFns.push(onRun);
            onExit && cleanupFns.push(onExit);
        }

        this.onExitFns = cleanupFns;

        for (let run of runFns) {
            run(this);
        }
    }


    private cleanupState(): void {
        for (let onExit of this.onExitFns) {
            onExit(this);
        }
        this.onExitFns = [];
    }


    private runOnEndFns(): void {
        for (let onEndFn of this.blueprint.onEnd || []) {
            onEndFn(this);
        }
    }
}
