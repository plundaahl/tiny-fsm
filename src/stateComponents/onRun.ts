import {
    StateSetupFn,
} from '../types';
import { IMachine } from '../IMachine';

/**
 * Runs the provided callback function after the associated state is entered.
 * The current MachineContext is passed to the callback to allow further
 * decision-making.
 *
 * @param fn Callback to run when the associated state exits.
 */
export const onRun = <T extends string>(fn: (machine: IMachine<T>) => void): StateSetupFn<string> => {
    return (machine: IMachine<T>) => {
        return { onRun: () => fn(machine) };
    }
}
