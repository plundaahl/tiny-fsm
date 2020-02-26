import { IMachineSPI } from '../IMachineSPI';
import { StateExitFn } from './StateExitFn';
import { StateRunFn } from './StateRunFn';

export type StateSetupFn<T extends string> = {
    (machine: IMachineSPI<T>): {
        onRun?: StateRunFn<T>,
        onExit?: StateExitFn<T>,
    }
};
