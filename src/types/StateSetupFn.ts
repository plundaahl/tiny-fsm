import { IMachineContext } from '../IMachineContext';
import { StateExitFn } from './StateExitFn';
import { StateRunFn } from './StateRunFn';

export type StateSetupFn<T extends string> = {
    (machine: IMachineContext<T>): {
        onRun?: StateRunFn,
        onExit?: StateExitFn,
    }
};
