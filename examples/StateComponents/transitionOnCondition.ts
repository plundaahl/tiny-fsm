import {
    IMachineSPI,
    StateSetupFn,
} from '../..';

/**
 * Immediately transitions to one of two states based on the result of the
 * condition function.
 */
export const transitionOnCondition = <T extends string>(
    condition: () => boolean,
    successState: T,
    failState: T,
): StateSetupFn<T, any> => {
    return (machine: IMachineSPI<T, any>) => {
        machine.transitionToState(condition()
            ? successState
            : failState
        );
    }
}
