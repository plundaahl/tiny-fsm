import { IAspect } from '../IAspect';
import { ICleanupMachine } from '../ICleanupMachine';

/**
 * Runs the provided callback when the associated state exits. The current
 * MachineContext is passed to that callback, to allow further decision-making.
 *
 * @param fn Callback to run when the associated state exits.
 */
export const onExit = <D>(
    fn: (machine: ICleanupMachine<D>) => void
): IAspect<string, D> => {
    return () => {
        return (machine: ICleanupMachine<D>) => {
            fn(machine);
        };
    };
};
