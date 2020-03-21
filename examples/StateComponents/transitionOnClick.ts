import {
    ISetupMachine,
    StateSetupFn,
} from '../..';

/**
 * This State Component lets us transition to another state by listening for
 * onclick events on a provided HTML element.
 */
export const transitionOnClick = <T extends string>(
    trigger: HTMLElement,
    state: T,
): StateSetupFn<T, any> => {
    return (machine: ISetupMachine<T, any>) => {
        trigger.onclick = () => machine.transitionToState(state);
        return () => { delete trigger.onclick };
    }
}
