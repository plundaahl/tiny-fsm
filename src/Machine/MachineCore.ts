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
    private isTransitioning: boolean = false;
    private isInCleanup: boolean = false;
    private nextState: S | 'end' | undefined;

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

        this.terminate = this.terminate.bind(this);
        this.isInitialized = this.isInitialized.bind(this);
        this.getAuxillaryData = this.getAuxillaryData.bind(this);
        this.setAuxillaryData = this.setAuxillaryData.bind(this);
        this.transitionToState = this.transitionToState.bind(this);
        this.initializeState = this.initializeState.bind(this);
        this.cleanupState = this.cleanupState.bind(this);
        this.runOnEndFns = this.runOnEndFns.bind(this);

        this.blueprint = blueprint as unknown as MachineBlueprint<S, D>;
        this.auxData = auxData;
        this.transitionToState(this.blueprint.initState);
    }


    terminate(): void {
        this.cleanupState();
        this.runOnEndFns();

        this.onEnd && this.onEnd(this);

        delete this.blueprint;
        delete this.auxData;

        delete this.nextState;
        this.isTransitioning = false;
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

        if (this.isInCleanup) {
            return;
        }

        if (this.isTransitioning) {
            this.nextState = this.nextState || state;
            return;
        }

        this.isTransitioning = true;
        if (state === 'end') {
            this.terminate();
        } else {
            this.cleanupState();
            this.initializeState(state);
        }
        this.isTransitioning = false;


        if (this.nextState !== undefined) {
            const { nextState } = this;
            delete this.nextState;
            this.transitionToState(nextState);
        }
    }


    private initializeState(state: S): void {
        const cleanupFns = [];

        for (let setupFn of this.blueprint.states[state]) {
            const onExit = setupFn(this);
            onExit && cleanupFns.push(onExit);
        }

        this.onExitFns = cleanupFns;
    }


    private cleanupState(): void {
        this.isInCleanup = true;
        for (let onExit of this.onExitFns) {
            onExit(this);
        }
        this.onExitFns = [];
        this.isInCleanup = false;
    }


    private runOnEndFns(): void {
        for (let onEndFn of this.blueprint.onEnd || []) {
            onEndFn(this);
        }
    }
}
