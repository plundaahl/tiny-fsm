import { IFsmManager } from '../IFsmManager';
import { IAuxDataContainer } from '../IAuxDataContainer';
import { MachineBlueprint, MachineTerminateFn } from '../types';
import { IMachine } from '../IMachine';
import { IIdPool, BasicIdPool } from '../IdPool';
import { Machine } from '../Machine';

const DEFAULT_INITIAL_CONTEXTS = 0;

export class FsmManager implements IFsmManager {
    private readonly machines: IMachine<string>[] = [];
    private readonly freeContexts: IMachine<string>[] = [];
    private readonly onMachineDestroyedListeners: MachineTerminateFn[] = [];
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
            .init(blueprint, id);

        this.machines[id] = context;
        return id;
    }

    deleteMachine(machineId: number): void {
        const context = this.machines[machineId];

        context.terminate();

        this.releaseContext(context);
        this.releaseId(machineId);
    }

    onMachineDestroyed(fn: MachineTerminateFn): void {
        this.onMachineDestroyedListeners.push(fn);
    }

    private createContext(): IMachine<string> {
        return new Machine<string>(this.handleMachineTerminate);
    }

    private provisionContext(): IMachine<string> {
        const context = this.freeContexts.shift();
        if (context) {
            return context;
        }

        return this.createContext();
    }

    private releaseContext(context: IMachine<string>): void {
        this.freeContexts.push(context);
    }

    private releaseId(machineId: number): void {
        delete this.machines[machineId];
        this.idPool.releaseId(machineId);
    }

    private handleMachineTerminate(machine: IAuxDataContainer): void {
        for (let fn of this.onMachineDestroyedListeners) {
            fn(machine);
        }
    }
}
