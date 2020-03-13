import {
    StateSetupFn,
} from '../..';

/**
 * Disables an HTMLInputElement while the current state is active, re-enabling
 * it onExit.
 */
export const disablesElement = <T extends string>(
    element: HTMLInputElement,
): StateSetupFn<T, any> => {
    return () => {
        element.disabled = true;
        return {
            onExit: () => element.disabled = false,
        }
    }
}
