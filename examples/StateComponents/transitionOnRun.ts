import { StateSetupFn } from '../..';
import { IMachineSPI } from '../..';

export const transitionOnRun = <T extends string>(state: T): StateSetupFn<T, any> => {
    return () => {
        return {
            onRun: (machine: IMachineSPI<T, any>) => machine.transitionToState(state),
        }
    }
}
