import { IAspect } from '../..';
import { ISetupMachine } from '../..';

export const transitionOnEnter = <T extends string>(
    state: T
): IAspect<T, any> => {
    return (machine: ISetupMachine<T, any>) => machine.transitionToState(state);
}
