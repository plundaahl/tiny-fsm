import { ICleanupMachine } from '../ICleanupMachine';

export type StateExitFn<D> = {
    (machine: ICleanupMachine<D>): void,
};
