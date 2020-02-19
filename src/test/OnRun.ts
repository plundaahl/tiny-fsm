import {
    StateSetupFn,
} from '../types';
import { IMachineContext } from '../IMachineContext';

export const onRun = <T extends string>(fn: (machine: IMachineContext<T>) => void): StateSetupFn<string> => {
    return (machine: IMachineContext<T>) => {
        return { onRun: () => fn(machine) };
    }
}
