import { IAspect } from '../IAspect';
import { ISetupMachine } from '../ISetupMachine';

/**
 * Runs the provided callback when the associated state is entered. The current
 * MachineContext is passed to that callback, to allow further decision-making.
 *
 * @param fn Callback to be run when the associated state is entered.
 */
export const onEnter = <T extends string, D>(
    fn: (machine: ISetupMachine<T, D>) => void
): IAspect<string, D> => {
    return (machine) => { fn(machine); };
}
