import { MachineBlueprint } from './types';
import { IMachine } from './IMachine';

export interface IInitableMachine<T extends string> extends IMachine<T> {
    init<T extends string>(
        blueprint: MachineBlueprint<T>,
        machineId: number,
    ): IInitableMachine<T>;

    isInitialized(): boolean;
}
