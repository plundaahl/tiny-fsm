import { ICleanupMachine } from './ICleanupMachine';

/**
 * Returned from Aspects, IAspectCleanupFns are responsible for performing any
 * cleanup required by their Aspect.
 *
 * Examples:
 * - Removing a class from an HTML element
 * - Clearing a timer
 * - Logging something
 */
export type IAspectCleanupFn<D> = {
    (machine: ICleanupMachine<D>): void,
};
