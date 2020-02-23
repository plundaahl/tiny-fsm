import { MachineBlueprint } from '../types';
import { IMachineContextController } from '../IMachineContextController';
import { IIdPool, BasicIdPool } from '../IdPool';
import { MachineContext } from '../MachineContext';

const DEFAULT_INITIAL_CONTEXTS = 0;

export class FsmManager {
    private readonly machines: IMachineContextController<string>[] = [];
    private readonly freeContexts: IMachineContextController<string>[] = [];
    private readonly onMachineDestroyedListeners: { (machineId: number): void }[] = [];
    private readonly idPool: IIdPool;

    constructor(settings?: {
        idPool?: IIdPool,
        initialContexts?: number,
    }) {
        this.handleMachineTerminate = this.handleMachineTerminate.bind(this);

        // Set IdPool
        this.idPool = settings?.idPool || new BasicIdPool();

        // Provision an initial pool of MachineContexts
        const initContexts = settings?.initialContexts || DEFAULT_INITIAL_CONTEXTS;
        if (initContexts < 0 || !Number.isInteger(initContexts)) {
            throw new Error('settings.initialContexts must be a non-negative integer.');
        }

        for (let i = 0; i < initContexts; i++) {
            this.freeContexts.push(this.createContext());
        }
    }

    createMachine<T extends string>(blueprint: MachineBlueprint<T>): number {
        const id = this.idPool.provisionId();
        if (id === undefined) {
            throw new Error('No more IDs available in ID pool.');
        }

        const context = this
            .provisionContext()
            .serviceMachine(blueprint, id);

        this.machines[id] = context;
        return id;
    }

    deleteMachine(machineId: number): void {
        const context = this.machines[machineId];

        context.transitionToState('end');

        this.releaseContext(context);
        this.releaseId(machineId);
    }

    onMachineDestroyed(fn: { (machineId: number): void }): void {
        this.onMachineDestroyedListeners.push(fn);
    }

    private createContext(): IMachineContextController<string> {
        return new MachineContext<string>(this.handleMachineTerminate);
    }

    private provisionContext(): IMachineContextController<string> {
        const context = this.freeContexts.shift();
        if (context) {
            return context;
        }

        return this.createContext();
    }

    private releaseContext(context: IMachineContextController<string>): void {
        this.freeContexts.push(context);
    }

    private releaseId(machineId: number): void {
        delete this.machines[machineId];
        this.idPool.releaseId(machineId);
    }

    private handleMachineTerminate(machineId: number): void {
        for (let fn of this.onMachineDestroyedListeners) {
            fn(machineId);
        }
    }
}
