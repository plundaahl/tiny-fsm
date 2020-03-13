import {
    IMachineSPI,
} from '../..';

/**
 *
 */
export const transitionAfterTimeout = <T extends string>(
    delayInMs: number,
    state: T,
) => {
    return (machine: IMachineSPI<T, any>) => {
        const timer = setTimeout(
            () => machine.transitionToState(state),
            delayInMs,
        );

        return {
            onExit: () => clearTimeout(timer),
        };
    }
}
