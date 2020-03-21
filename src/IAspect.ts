import { ISetupMachine } from './ISetupMachine';
import { IAspectCleanupFn } from './IAspectCleanupFn';

/**
 * Aspects represent a single feature of a state. They are designed to be able
 * to be grouped, so that you can describe states declaratively by selecting
 * and configuring the Aspects you want.
 *
 * An Aspect is just a function, which will be run every time a state begins,
 * and which returns an optional IAspectCleanupFn.
 *
 * Aspect examples:
 * - Transitions to a new state after a given amount of time
 * - Sets a class on an HTML element
 * - Logs some output when the state is initialized
 * - Increments a counter
 */
export type IAspect<T extends string, D> = {
    (machine: ISetupMachine<T, D>): IAspectCleanupFn<D> | void
};
