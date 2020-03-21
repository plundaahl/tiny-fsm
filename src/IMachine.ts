import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';
import { IBlueprint } from './IBlueprint';

/**
 * Machines contain the core logic of TinyFSM. They are responsible for running
 * Blueprints, and contain all of the mechanisms required to digest and run a
 * blueprint, handle transitions between states, and clean up when the machine
 * terminates.
 *
 * Machines are reusable, so as long as a machine has finished running its last
 * Blueprint, you are free to run a new one with it.
 */
export interface IMachine<D> extends IAuxDataHoldingMachine<D> {
    runBlueprint<S extends string>(blueprint: IBlueprint<S, D>, auxillaryData?: D): void;
    isRunning(): boolean;
    terminate(): void;
}
