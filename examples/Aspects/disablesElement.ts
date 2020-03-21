import {
    IAspect,
} from '../..';

/**
 * Disables an HTMLInputElement while the current state is active, re-enabling
 * it onExit.
 */
export const disablesElement = <T extends string>(
    element: HTMLInputElement,
): IAspect<T, any> => {
    return () => {
        element.disabled = true;
        return () => { element.disabled = false };
    }
}
