import { IAuxDataContainer } from '../IAuxDataContainer';

export type MachineTerminateFn = {
    (machine: IAuxDataContainer): void,
};
