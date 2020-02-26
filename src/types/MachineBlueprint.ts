import { StateSetupFn } from './StateSetupFn';
import { MachineTerminateFn } from './MachineTerminateFn';

export type MachineBlueprint<S extends string, D> = {
    initState: S,
    states: {
        [K in S]: StateSetupFn<S | 'end', D>[]
    },
    onEnd?: MachineTerminateFn<D>[],
};
