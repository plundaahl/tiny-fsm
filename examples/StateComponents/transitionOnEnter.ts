import { StateSetupFn } from '../..';
import { ISetupMachine } from '../..';

export const transitionOnEnter = <T extends string>(
    state: T
): StateSetupFn<T, any> => {
    return (machine: ISetupMachine<T, any>) => machine.transitionToState(state);
}
