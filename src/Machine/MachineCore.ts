import { IMachine } from '../IMachine';
import { ISetupMachine } from '../ISetupMachine';
import { ICleanupMachine } from '../ICleanupMachine';
import { IBlueprint } from '../IBlueprint';
import { IAspectCleanupFn } from '../IAspectCleanupFn';
import { IMachineTerminateFn } from '../IMachineTerminateFn';


export class MachineCore<S extends string, D>
    implements IMachine<D>, ISetupMachine<S, D>, ICleanupMachine<D> {

    private setupMachine: ISetupMachine<S, D>;
    private cleanupMachine: ICleanupMachine<D>;
    private readonly onEnd?: IMachineTerminateFn<D>;
    private auxData?: D;
    private blueprint: IBlueprint<S, D>;
    private onExitFns: IAspectCleanupFn<D>[] = [];
    private isTransitioning: boolean = false;
    private nextState: S | 'end' | undefined;

    constructor(onEnd?: IMachineTerminateFn<D>) {
        this.onEnd = onEnd;
    }


    runBlueprint<J extends string>(
        blueprint: IBlueprint<J, D>,
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
        this.isRunning = this.isRunning.bind(this);
        this.getAuxillaryData = this.getAuxillaryData.bind(this);
        this.setAuxillaryData = this.setAuxillaryData.bind(this);
        this.transitionToState = this.transitionToState.bind(this);
        this.initializeState = this.initializeState.bind(this);
        this.cleanupState = this.cleanupState.bind(this);
        this.runOnEndFns = this.runOnEndFns.bind(this);

        this.setupMachine = {
            getAuxillaryData: this.getAuxillaryData,
            setAuxillaryData: this.setAuxillaryData,
            transitionToState: this.transitionToState,
            terminate: this.terminate,
        };

        this.cleanupMachine = {
            getAuxillaryData: this.getAuxillaryData,
            setAuxillaryData: this.setAuxillaryData,
            terminate: this.terminate,
        };

        this.blueprint = blueprint as unknown as IBlueprint<S, D>;
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


    isRunning(): boolean {
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
            const onExit = setupFn(this.setupMachine);
            onExit && cleanupFns.push(onExit);
        }

        this.onExitFns = cleanupFns;
    }


    private cleanupState(): void {
        for (let onExit of this.onExitFns) {
            onExit(this.cleanupMachine);
        }
        this.onExitFns = [];
    }


    private runOnEndFns(): void {
        for (let onEndFn of this.blueprint.onEnd || []) {
            onEndFn(this);
        }
    }
}
