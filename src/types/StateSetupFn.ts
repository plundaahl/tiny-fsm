import { IMachineSPI } from '../IMachineSPI';
import { StateExitFn } from './StateExitFn';

export type StateSetupFn<T extends string, D> = {
    (machine: IMachineSPI<T, D>): StateExitFn<T, D> | void
};
