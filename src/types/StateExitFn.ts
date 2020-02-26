import { IMachineSPI } from '../IMachineSPI';

export type StateExitFn<T extends string> = {
    (machine: IMachineSPI<T>): void,
};
