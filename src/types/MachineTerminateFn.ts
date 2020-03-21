import { IAuxDataHoldingMachine } from '../IAuxDataHoldingMachine';

export type MachineTerminateFn<D> = {
    (machine: IAuxDataHoldingMachine<D>): void,
};
