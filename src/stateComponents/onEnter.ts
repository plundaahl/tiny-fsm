import {
    StateSetupFn,
} from '../types';
import { IMachine } from '../IMachine';

/**
 * Runs the provided callback when the associated state is entered. The current
 * MachineContext is passed to that callback, to allow further decision-making.
 *
 * @param fn Callback to be run when the associated state is entered.
 */
export const onEnter = <T extends string>(fn: (machine: IMachine<T>) => void): StateSetupFn<string> => {
    return (machine: IMachine<T>) => {
        fn(machine);
        return {};
    }
}
