import { ISetupMachine } from '../ISetupMachine';
import { StateExitFn } from './StateExitFn';

export type StateSetupFn<T extends string, D> = {
    (machine: ISetupMachine<T, D>): StateExitFn<D> | void
};
