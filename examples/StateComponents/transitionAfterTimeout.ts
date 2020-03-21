import {
    ISetupMachine,
    StateSetupFn,
} from '../..';

/**
 * Waits a given number of milliseconds, then transitions.
 */
export const transitionAfterTimeout = <T extends string>(
    delayInMs: number,
    state: T,
): StateSetupFn<T, any> => {
    return (machine: ISetupMachine<T, any>) => {
        const timer = setTimeout(
            () => machine.transitionToState(state),
            delayInMs,
        );

        return () => { clearTimeout(timer); }
    }
}
