import { IAuxDataContainer } from './IAuxDataContainer';
import { MachineBlueprint } from './types';

/**
 * External interface for TinyFSM state machines. For the interface that is
 * presented to state components (e.g., when states are entered, run, or
 * exited), see IMachineSPI.
 */
export interface IMachine<T extends string> extends IAuxDataContainer {
    init<T extends string>(blueprint: MachineBlueprint<T>, machineId: number): IMachine<T>;
    isInitialized(): boolean;
    terminate(): void;
}
