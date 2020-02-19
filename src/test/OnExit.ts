import {
    StateSetupFn,
} from '../types';
import { IMachineContext } from '../IMachineContext';

export const onExit = <T extends string>(fn: (machine: IMachineContext<T>) => void): StateSetupFn<string> => {
    return (machine: IMachineContext<T>) => {
        return { onExit: () => fn(machine) };
    }
}
