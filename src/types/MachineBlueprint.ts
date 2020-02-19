import { StateExitFn } from './StateExitFn';
import { StateSetupFn } from './StateSetupFn';

export type MachineBlueprint<T extends string> = {
    initState: T,
    states: {
        [K in T]: StateSetupFn<T>[]
    },
    onEnd?: StateExitFn[],
};
