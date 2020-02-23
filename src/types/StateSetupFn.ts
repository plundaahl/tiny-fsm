import { IMachine } from '../IMachine';
import { StateExitFn } from './StateExitFn';
import { StateRunFn } from './StateRunFn';

export type StateSetupFn<T extends string> = {
    (machine: IMachine<T>): {
        onRun?: StateRunFn,
        onExit?: StateExitFn,
    }
};
