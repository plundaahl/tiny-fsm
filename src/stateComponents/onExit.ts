import {
    StateSetupFn,
} from '../types';
import { IMachineSPI } from '../IMachineSPI';

/**
 * Runs the provided callback when the associated state exits. The current
 * MachineContext is passed to that callback, to allow further decision-making.
 *
 * @param fn Callback to run when the associated state exits.
 */
export const onExit = <T extends string, D>(fn: (machine: IMachineSPI<T, D>) => void): StateSetupFn<string, D> => {
    return (machine: IMachineSPI<T, D>) => {
        return { onExit: () => fn(machine) };
    }
}
