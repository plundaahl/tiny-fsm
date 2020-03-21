import { ICleanupMachine } from './ICleanupMachine';

export type IAspectCleanupFn<D> = {
    (machine: ICleanupMachine<D>): void,
};
