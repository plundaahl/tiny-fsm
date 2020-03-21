import { IAspect } from './/IAspect';
import { IMachineTerminateFn } from './IMachineTerminateFn';

/**
 * The Blueprint type provides the core programming model of TinyFSM, and is
 * used to define a finite state machine. Its main feature is a collection of
 * named states, each of which consist of zero or more Aspects.
 *
 * The names of the states should be provided to the first generic parameter as
 * a union type, e.g. 'stateA' | 'stateB' | 'stateC'. This provides type
 * checking, while also allowing arbitrarily-named states.
 *
 * The second parameter defines the type of auxillary data the Blueprint
 * expects. See IAuxDataHoldingMachine for details.
 */
export type IBlueprint<S extends string, D> = {
    initState: S,
    states: {
        [K in S]: IAspect<S | 'end', D>[]
    },
    onEnd?: IMachineTerminateFn<D>[],
};
