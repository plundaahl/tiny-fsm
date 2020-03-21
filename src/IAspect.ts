import { ISetupMachine } from './ISetupMachine';
import { IAspectCleanupFn } from './IAspectCleanupFn';

export type IAspect<T extends string, D> = {
    (machine: ISetupMachine<T, D>): IAspectCleanupFn<D> | void
};
