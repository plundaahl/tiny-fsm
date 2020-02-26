import { IAuxDataContainer } from './IAuxDataContainer';
/**
 * Internal interface for TinyFSM state machines. This interface is injected
 * into state components onEnter, onRun, and onExit.
 */
export interface IMachineSPI<T extends string, D> extends IAuxDataContainer<D> {
    transitionToState(state: T | 'end'): void;
    terminate(): void;
}
