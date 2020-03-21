import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';

/**
 * ISetupMachines are service interfaces, which provide access to a limited
 * subset of the methods available on an IMachine.
 *
 * When a Machine transitions into a new state, it runs all IAspect functions
 * for the new state, and passes an ISetupMachine into each one. This allows the
 * IAspect function to make decisions or perform further actions relating to
 * the Machine, such as perform a transition or get or set the auxillary data
 * attached to it.
 */
export interface ISetupMachine<T extends string, D> extends IAuxDataHoldingMachine<D> {
    transitionToState(state: T | 'end'): void;
    terminate(): void;
}
