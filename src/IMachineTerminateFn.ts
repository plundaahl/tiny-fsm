import { IAuxDataHoldingMachine } from './IAuxDataHoldingMachine';

export type IMachineTerminateFn<D> = {
    (machine: IAuxDataHoldingMachine<D>): void,
};
