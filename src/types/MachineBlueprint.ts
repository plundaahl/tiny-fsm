import { StateExitFn } from './StateExitFn';
import { StateSetupFn } from './StateSetupFn';
import { MachineTerminateFn } from './MachineTerminateFn';

export type MachineBlueprint<T extends string> = {
    initState: T,
    states: {
        [K in T]: StateSetupFn<T>[]
    },
    onEnd?: MachineTerminateFn[],
};
