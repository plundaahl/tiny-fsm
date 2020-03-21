import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';

/**
 * ICleanupMachines are service interfaces, which provide access to a limited
 * subset of the methods available on an IMachine.
 *
 * When a Machine transitions out of its current state, it runs all
 * IAspectCleanupFns for the current state, and passes an ICleanupMachine into
 * each one. This allows the IAspectCleanupFn to make decisions or perform
 * further actions relating to the Machine.
 */
export interface ICleanupMachine<D> extends IAuxDataHoldingMachine<D> {
    terminate(): void;
}
