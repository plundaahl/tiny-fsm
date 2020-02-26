import { IMachineSPI } from '../IMachineSPI';

export type StateRunFn<T extends string, D> = {
    (machine: IMachineSPI<T, D>): void,
};
