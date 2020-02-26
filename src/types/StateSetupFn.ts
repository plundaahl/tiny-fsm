import { IMachineSPI } from '../IMachineSPI';
import { StateExitFn } from './StateExitFn';
import { StateRunFn } from './StateRunFn';

export type StateSetupFn<T extends string, D> = {
    (machine: IMachineSPI<T, D>): {
        onRun?: StateRunFn<T, D>,
        onExit?: StateExitFn<T, D>,
    }
};
