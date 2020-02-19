import {
    StateSetupFn,
} from '../types';
import { IMachineContext } from '../IMachineContext';

export const onEnter = <T extends string>(fn: (machine: IMachineContext<T>) => void): StateSetupFn<string> => {
    return (machine: IMachineContext<T>) => {
        fn(machine);
        return {};
    }
}
