import { StateSetupFn } from '../..';
import { IMachineSPI } from '../..';

export const transitionOnEnter = <T extends string>(
    state: T
): StateSetupFn<T, any> => {
    return (machine: IMachineSPI<T, any>) => machine.transitionToState(state);
}
