import {
    ISetupMachine,
    IAspect,
} from '../..';

/**
 * This aspect lets us transition to another state by listening for
 * onclick events on a provided HTML element.
 */
export const transitionOnClick = <T extends string>(
    trigger: HTMLElement,
    state: T,
): IAspect<T, any> => {
    return (machine: ISetupMachine<T, any>) => {
        trigger.onclick = () => machine.transitionToState(state);
        return () => { delete trigger.onclick };
    }
}
