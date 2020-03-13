import {
    IMachineSPI,
} from '../..';

/**
 *
 */
export const transitionOnCondition = <T extends string>(
    condition: () => boolean,
    successState: T,
    failState: T,
) => {
    return () => {
        return {
            onRun: (machine: IMachineSPI<T, any>) => machine.transitionToState(condition()
                ? successState
                : failState
            ),
        };
    }
}
