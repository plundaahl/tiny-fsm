import { StateSetupFn } from '../../../..';

/**
 * This State Component toggles the 'lit' class on/off on the provided
 * HTMLElement whenever the state is entered/exited.
 */
export const powersLight = (light: HTMLElement): StateSetupFn<string, any> => {
    return () => {
        light.classList.add('lit');
        return () => light.classList.remove('lit');
    }
}
