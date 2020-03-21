import { IAspect } from '../../../..';

/**
 * This aspect toggles the 'lit' class on/off on the provided
 * HTMLElement whenever the state is entered/exited.
 */
export const powersLight = (light: HTMLElement): IAspect<string, any> => {
    return () => {
        light.classList.add('lit');
        return () => light.classList.remove('lit');
    }
}
