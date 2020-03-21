import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';
import { IBlueprint } from './IBlueprint';

/**
 * External interface for TinyFSM state machines. For the interface that is
 * presented to aspects (e.g., when states are entered, run, or
 * exited), see IMachineSPI.
 */
export interface IMachine<D> extends IAuxDataHoldingMachine<D> {
    init<S extends string>(blueprint: IBlueprint<S, D>, auxillaryData?: D): void;
    isInitialized(): boolean;
    terminate(): void;
}
