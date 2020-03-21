import {
    ISetupMachine,
    IAspect,
} from '../..';

/**
 * Immediately transitions to one of two states based on the result of the
 * condition function.
 */
export const transitionOnCondition = <T extends string>(
    condition: () => boolean,
    successState: T,
    failState: T,
): IAspect<T, any> => {
    return (machine: ISetupMachine<T, any>) => {
        machine.transitionToState(condition()
            ? successState
            : failState
        );
    }
}
