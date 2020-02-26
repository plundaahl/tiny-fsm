import {
    StateSetupFn,
} from '../types';
import { IMachineSPI } from '../IMachineSPI';

/**
 * Runs the provided callback when the associated state is entered. The current
 * MachineContext is passed to that callback, to allow further decision-making.
 *
 * @param fn Callback to be run when the associated state is entered.
 */
export const onEnter = <T extends string, D>(fn: (machine: IMachineSPI<T, D>) => void): StateSetupFn<string, D> => {
    return (machine: IMachineSPI<T, D>) => {
        fn(machine);
        return {};
    }
}
