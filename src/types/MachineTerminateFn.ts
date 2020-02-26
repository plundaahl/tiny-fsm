import { IAuxDataContainer } from '../IAuxDataContainer';

export type MachineTerminateFn<D> = {
    (machine: IAuxDataContainer<D>): void,
};
