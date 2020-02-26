import { IMachineSPI } from '../IMachineSPI';

export type StateRunFn<T extends string> = {
    (machine: IMachineSPI<T>): void,
};
