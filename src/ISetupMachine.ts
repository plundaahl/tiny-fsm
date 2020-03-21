import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';

/**
 * Internal interface for TinyFSM state machines. This interface is injected
 * into aspects setup functions.
 */
export interface ISetupMachine<T extends string, D> extends IAuxDataHoldingMachine<D> {
    transitionToState(state: T | 'end'): void;
    terminate(): void;
}
