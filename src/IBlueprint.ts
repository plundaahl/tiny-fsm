import { IAspect } from './/IAspect';
import { IMachineTerminateFn } from './IMachineTerminateFn';

export type IBlueprint<S extends string, D> = {
    initState: S,
    states: {
        [K in S]: IAspect<S | 'end', D>[]
    },
    onEnd?: IMachineTerminateFn<D>[],
};
