import { MachineBlueprint, MachineTerminateFn } from './types';

export interface IFsmManager {
    createMachine<T extends string>(blueprint: MachineBlueprint<T>): number;
    deleteMachine(machineId: number): void;
    onMachineDestroyed(fn: MachineTerminateFn): void;
}
