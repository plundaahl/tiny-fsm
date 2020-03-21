import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';

/**
 * Functions of this type may be included in a Blueprint's onExit property.
 * When the Machine that is running the Blueprint terminates, it will call each
 * of the attached IMachineTerminateFns.
 *
 * Note that an IAuxDataHoldingMachine will be passed in. This object provides
 * access to a limited subset of the methods on IMachine, which allows the
 * IMachineTerminateFn to access whatever auxillary is stored in the Machine.
 */
export type IMachineTerminateFn<D> = {
    (machine: IAuxDataHoldingMachine<D>): void,
};
