import { IMachineSPI } from '../IMachineSPI';

export type StateExitFn<T extends string, D> = {
    (machine: IMachineSPI<T, D>): void,
};
