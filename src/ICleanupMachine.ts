import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';

/**
 * Internal interface for TinyFSM state machines. This interface is injected
 * into AspectCleanupFns.
 */
export interface ICleanupMachine<D> extends IAuxDataHoldingMachine<D> {
    terminate(): void;
}
