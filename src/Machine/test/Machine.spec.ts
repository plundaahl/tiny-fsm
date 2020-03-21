import { IMachine } from '../../IMachine';
import { Machine } from "../Machine";
import {
    onEnter,
    onExit,
} from '../../stateComponents';
import {
    createTrigger,
    transitionOnTrigger,
} from './TransitionOnTrigger';
import { ISetupMachine } from '../../ISetupMachine';
import { ICleanupMachine } from '../../ICleanupMachine';


describe('init', () => {
    test('Given machine is initialized, when init() is called, error.', () => {
        const machine: IMachine<undefined> = new Machine();

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            }
        });

        expect(() => {
            machine.init<'stateA'>({
                initState: 'stateA',
                states: {
                    stateA: [],
                }
            });
        }).toThrowError();
    });


    test('Given machine not initialized, when init() is called, the initState is entered', () => {
        const machine: IMachine<undefined> = new Machine();
        const onEnterA = jest.fn();
        const onEnterB = jest.fn();
        const onEnterC = jest.fn();

        machine.init<'stateA' | 'stateB' | 'stateC'>({
            initState: 'stateB',
            states: {
                stateA: [onEnter(onEnterA)],
                stateB: [onEnter(onEnterB)],
                stateC: [onEnter(onEnterC)],
            }
        });

        expect(onEnterA).not.toHaveBeenCalled();
        expect(onEnterB).toHaveBeenCalled();
        expect(onEnterC).not.toHaveBeenCalled();
    });
});


describe('Transitioning State', () => {
    test('When a transition is triggered, then the machine correctly transitions state', () => {
        const trigger = createTrigger();
        const machine: IMachine<undefined> = new Machine();
        let curState: string = '';

        machine.init<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    transitionOnTrigger(trigger, 'stateB'),
                    onEnter(() => curState = 'stateA'),
                ],
                stateB: [
                    transitionOnTrigger(trigger, 'stateA'),
                    onEnter(() => curState = 'stateB'),
                ],
            }
        });

        expect(curState).toBe('stateA');

        trigger.trigger();
        expect(curState).toBe('stateB');

        trigger.trigger();
        expect(curState).toBe('stateA');
    });

    test('When a transition is triggered during state setup, all setup functions run before next transition', () => {
        const machine: IMachine<undefined> = new Machine();
        const callStack: string[] = [];

        const ENTERED_STATE_B = 'Entered State B';
        const TRANSITION_NOT_YET_TRIGGERED = 'Transition Not Yet Triggered';
        const TRIGGERING_TRANSITION = 'Triggering Transition';
        const TRANSITION_WAS_TRIGGERED = 'Transition Was Triggered';

        const enteredStateB = () => {
            callStack.push(ENTERED_STATE_B);
        };
        const preTransitionSetupFn = () => {
            callStack.push(TRANSITION_NOT_YET_TRIGGERED);
        };
        const triggerTransition = (machine: ISetupMachine<'stateA' | 'stateB', undefined>) => {
            callStack.push(TRIGGERING_TRANSITION);
            machine.transitionToState('stateB');
        };
        const postTransitionSetupFn = () => {
            callStack.push(TRANSITION_WAS_TRIGGERED);
        };

        machine.init<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    preTransitionSetupFn,
                    triggerTransition,
                    postTransitionSetupFn,
                ],
                stateB: [
                    enteredStateB,
                ],
            }
        });

        expect(callStack[0]).toBe(TRANSITION_NOT_YET_TRIGGERED);
        expect(callStack[1]).toBe(TRIGGERING_TRANSITION);
        expect(callStack[2]).toBe(TRANSITION_WAS_TRIGGERED);
        expect(callStack[3]).toBe(ENTERED_STATE_B);
    });

    test('When a transition is triggered during state setup, all setup functions run before any teardown functions', () => {
        const machine: IMachine<undefined> = new Machine();
        const callStack: string[] = [];

        const TRANSITION_COMPLETE = 'Transition Complete';
        const TRIGGER_SETUP = 'Trigger Setup Function';
        const PRE_TRIGGER_TEARDOWN = 'Pre-Trigger Teardown Function';
        const TRIGGER_TEARDOWN = 'Trigger Teardown Function';
        const POST_TRIGGER_TEARDOWN = 'Post-Trigger Teardown Function';

        const enteredStateB = () => {
            callStack.push(TRANSITION_COMPLETE);
        };
        const preTrigger = () => () => callStack.push(PRE_TRIGGER_TEARDOWN);
        const trigger = (machine: ISetupMachine<'stateA' | 'stateB', undefined>) => {
            callStack.push(TRIGGER_SETUP);
            machine.transitionToState('stateB');
            return () => callStack.push(TRIGGER_TEARDOWN);
        };
        const postTrigger = () => () => callStack.push(POST_TRIGGER_TEARDOWN);

        machine.init<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    preTrigger,
                    trigger,
                    postTrigger,
                ],
                stateB: [
                    enteredStateB,
                ],
            }
        });

        expect(callStack[0]).toBe(TRIGGER_SETUP);
        expect(callStack[1]).toBe(PRE_TRIGGER_TEARDOWN);
        expect(callStack[2]).toBe(TRIGGER_TEARDOWN);
        expect(callStack[3]).toBe(POST_TRIGGER_TEARDOWN);
        expect(callStack[4]).toBe(TRANSITION_COMPLETE);
    });

    test('When multiple transitions are triggered during state setup, only the first is run', () => {
        const machine: IMachine<undefined> = new Machine();
        const callStack: string[] = [];

        const ENTERED_STATE_C = 'entered state C';
        const ENTERED_STATE_B = 'entered state B';

        machine.init<'stateA' | 'stateB' | 'stateC'>({
            initState: 'stateA',
            states: {
                stateA: [
                    (machine) => machine.transitionToState('stateB'),
                    (machine) => machine.transitionToState('stateC'),
                ],
                stateB: [
                    () => { callStack.push(ENTERED_STATE_B); },
                ],
                stateC: [
                    () => { callStack.push(ENTERED_STATE_C); },
                ]
            }
        });

        expect(callStack).toContain(ENTERED_STATE_B);
        expect(callStack).not.toContain(ENTERED_STATE_C);
    });
});


describe('Auxillary Data', () => {
    // test('Given machine not initialized, when id is called, error', () => {
    //     const machine: IMachine<undefined> = new Machine<'stateA' | 'stateB'>();
    //     expect(() => machine.id).toThrowError();
    // });
});

describe('Entering a state', () => {
    test('When a state is entered, then all onEnter functions for that state are run', () => {
        const machine: IMachine<undefined> = new Machine();
        const onEnterFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [...onEnterFns.map(fn => onEnter(fn))],
            }
        });

        for (let fn of onEnterFns) {
            expect(fn).toHaveBeenCalled();
        }
    });


    test('When a state is entered, then onEnter functions are run in the order listed', () => {
        const machine: IMachine<undefined> = new Machine();
        const fnCalls: string[] = [];
        const onEnterFns = [
            () => fnCalls.push('onEnter1'),
            () => fnCalls.push('onEnter2'),
            () => fnCalls.push('onEnter3'),
        ];

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [...onEnterFns.map(fn => onEnter(fn))],
            }
        });

        expect(fnCalls.indexOf('onEnter1')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onEnter2')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onEnter3')).toBeGreaterThan(-1);

        expect(fnCalls.indexOf('onEnter1')).toBeLessThan(fnCalls.indexOf('onEnter2'));
        expect(fnCalls.indexOf('onEnter2')).toBeLessThan(fnCalls.indexOf('onEnter3'));
    });


    test('When a state is entered, then NO onExit functions for that state are run', () => {
        const machine: IMachine<undefined> = new Machine();
        const onExitFn = jest.fn();

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onExit(onExitFn)],
            }
        });

        expect(onExitFn).not.toHaveBeenCalled();
    });


    test('When a state is entered, then NO onEnter functions from any other state are run', () => {
        const machine: IMachine<undefined> = new Machine();
        const onEnterStateB = jest.fn();
        const onEnterStateC = jest.fn();
        const onEnterStateD = jest.fn();

        machine.init<'stateA' | 'stateB' | 'stateC' | 'stateD'>({
            initState: 'stateA',
            states: {
                stateA: [],
                stateB: [onEnter(onEnterStateB)],
                stateC: [onEnter(onEnterStateC)],
                stateD: [onEnter(onEnterStateD)],
            }
        });

        expect(onEnterStateB).not.toHaveBeenCalled();
        expect(onEnterStateC).not.toHaveBeenCalled();
        expect(onEnterStateD).not.toHaveBeenCalled();
    });


    test('When a state is entered, then NO onExit functions for that state are run', () => {
        const machine: IMachine<undefined> = new Machine();
        const onExitFn = jest.fn();

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onExit(onExitFn)],
            }
        });

        expect(onExitFn).not.toHaveBeenCalled();
    });
});


describe('State exit behavior', () => {
    test('When a state is exited, then all onExit functions for that state are called', () => {
        const trigger = createTrigger();
        const machine: IMachine<undefined> = new Machine();
        const onExitFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]

        machine.init<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    transitionOnTrigger(trigger, 'stateB'),
                    ...onExitFns.map(fn => onExit(fn))
                ],
                stateB: [],
            }
        });

        for (let fn of onExitFns) {
            expect(fn).not.toHaveBeenCalled();
        }

        trigger.trigger();

        for (let fn of onExitFns) {
            expect(fn).toHaveBeenCalled();
        }
    });


    test('When a state is exited, then onExit functions for that state are called in order', () => {
        const trigger = createTrigger();
        const machine: IMachine<undefined> = new Machine();
        const fnCalls: string[] = [];
        const onExitFns = [
            () => fnCalls.push('exitFn1'),
            () => fnCalls.push('exitFn2'),
            () => fnCalls.push('exitFn3'),
        ];

        machine.init<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    transitionOnTrigger(trigger, 'stateB'),
                    ...onExitFns.map(fn => onExit(fn))
                ],
                stateB: [],
            }
        });

        trigger.trigger();

        expect(fnCalls[0]).toBe('exitFn1');
        expect(fnCalls[1]).toBe('exitFn2');
        expect(fnCalls[2]).toBe('exitFn3');
    });


    test('When a state is exited, then NO onEnter functions for that state are called', () => {
        const trigger = createTrigger();
        const machine: IMachine<undefined> = new Machine();
        const onEnterFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]

        machine.init<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    transitionOnTrigger(trigger, 'stateB'),
                    ...onEnterFns.map(fn => onEnter(fn))
                ],
                stateB: [],
            }
        });

        for (let fn of onEnterFns) {
            expect(fn).toHaveBeenCalledTimes(1);
        }

        trigger.trigger();

        for (let fn of onEnterFns) {
            expect(fn).toHaveBeenCalledTimes(1);
        }
    });


    test('When a state is exited, then NO onExit functions from any other state are run', () => {
        const trigger = createTrigger();
        const machine: IMachine<undefined> = new Machine();
        const onExitStateB = jest.fn();
        const onExitStateC = jest.fn();
        const onExitStateD = jest.fn();

        machine.init<'stateA' | 'stateB' | 'stateC' | 'stateD'>({
            initState: 'stateA',
            states: {
                stateA: [transitionOnTrigger(trigger, 'stateB')],
                stateB: [onExit(onExitStateB)],
                stateC: [onExit(onExitStateC)],
                stateD: [onExit(onExitStateD)],
            }
        });

        trigger.trigger();

        expect(onExitStateB).not.toHaveBeenCalled();
        expect(onExitStateC).not.toHaveBeenCalled();
        expect(onExitStateD).not.toHaveBeenCalled();
    });
});


describe('isInService', () => {
    test('Given machine is initialized, when isInService() called, then return true', () => {
        const machine: IMachine<undefined> = new Machine();
        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            }
        });

        expect(machine.isInitialized()).toBe(true);
    });


    test('Given machine NOT initialized, when isInService() called, then return false', () => {
        const machine = new Machine();
        expect(machine.isInitialized()).toBe(false);
    });


    test('Given machine was terminated, when isInService() called, then return false', () => {
        const machine: IMachine<undefined> = new Machine();
        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            }
        });
        machine.terminate();

        expect(machine.isInitialized()).toBe(false);
    });
});



describe('terminating a machine', () => {
    test('When a machine is terminated, onExit functions for the current state are run', () => {
        const machine: IMachine<undefined> = new Machine();
        const onExitFn = jest.fn();

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onExit(onExitFn)],
            }
        });

        machine.terminate();
        expect(onExitFn).toHaveBeenCalled();
    });


    test('When a machine is terminated, onEnd functions are run', () => {
        const machine: IMachine<undefined> = new Machine();
        const onEndFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            },
            onEnd: [...onEndFns]
        });

        for (let fn of onEndFns) {
            expect(fn).not.toHaveBeenCalled();
        }

        machine.terminate();

        for (let fn of onEndFns) {
            expect(fn).toHaveBeenCalled();
        }
    });


    test('When transitionToState() is called with state "end," then machine is terminated', () => {
        const machine: IMachine<undefined> = new Machine();
        const trigger = createTrigger();
        const onEndFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];

        machine.init<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [transitionOnTrigger(trigger, 'end')],
            },
            onEnd: [...onEndFns]
        });


        for (let fn of onEndFns) {
            expect(fn).not.toHaveBeenCalled();
        }

        trigger.trigger();

        for (let fn of onEndFns) {
            expect(fn).toHaveBeenCalled();
        }
    });
});
