import { MachineBlueprint } from './types';
import { IMachineContext } from './IMachineContext';

export interface IMachineContextController<T extends string> extends IMachineContext<T> {
    serviceMachine<T extends string>(
        blueprint: MachineBlueprint<T>,
        machineId: number,
    ): IMachineContextController<T>;

    isInService(): boolean;
}
