import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';
import { MachineBlueprint } from './types';

/**
 * External interface for TinyFSM state machines. For the interface that is
 * presented to state components (e.g., when states are entered, run, or
 * exited), see IMachineSPI.
 */
export interface IMachine<D> extends IAuxDataHoldingMachine<D> {
    init<S extends string>(blueprint: MachineBlueprint<S, D>, auxillaryData?: D): void;
    isInitialized(): boolean;
    terminate(): void;
}
