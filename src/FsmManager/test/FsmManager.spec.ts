import { BasicIdPool } from '../../IdPool';
import { FsmManager } from '../FsmManager';
import {
    createTrigger,
    transitionOnTrigger,
} from './TransitionOnTrigger';
import {
    onEnter,
    onRun,
    onExit,
} from '../../stateComponents';
import { IMachineContext } from '../../IMachineContext';

const getMockIdPool = (useFn: () => void) => {
    return new (class MockIdPool extends BasicIdPool {
        get usedCapacity(): number {
            useFn();
            return super.usedCapacity;
        }
        get remainingCapacity(): number {
            useFn();
            return super.remainingCapacity;
        };
        get maxCapacity(): number {
            useFn();
            return super.maxCapacity;
        };
        provisionId(): number | undefined {
            useFn();
            return super.provisionId();
        }
        releaseId(id: number): void {
            useFn();
            return super.releaseId(id);
        }
        isIdProvisioned(id: number): boolean {
            useFn();
            return super.isIdProvisioned(id);
        }
    })();
}


describe('FsmManager construction', () => {
    test('When FmsManager is created with negative initialContexts, then error', () => {
        expect(() => new FsmManager({ initialContexts: -1 })).toThrowError();
        expect(() => new FsmManager({ initialContexts: -9123 })).toThrowError();
    });


    test('When FmsManager is created with non-negative initialContexts, do not error', () => {
        expect(() => new FsmManager({ initialContexts: 0 })).not.toThrowError();
        expect(() => new FsmManager({ initialContexts: 123 })).not.toThrowError();
    });


    test('When FsmManager is created with idPool, then that IdPool is used', () => {
        const useFn = jest.fn();
        const mgr = new FsmManager({ idPool: getMockIdPool(useFn) });
        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            }
        });
        expect(useFn).toHaveBeenCalled();
    });
});


describe('Machine creation', () => {
    test('When a machine is created, then it enters the initial state', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        let curState: string = '';

        const initState = 'stateB';

        mgr.createMachine<'stateA' | 'stateB' | 'stateC'>({
            initState,
            states: {
                stateA: [onEnter(() => curState = 'stateA')],
                stateB: [onEnter(() => curState = 'stateB')],
                stateC: [onEnter(() => curState = 'stateC')],
            }
        });

        expect(curState).toBe(initState);
    });


    test('Given there are free contexts, when a machine is created, then those contexts are reused', () => {
        const mgr = new FsmManager({ initialContexts: 1 });
        let context1: undefined | IMachineContext<any>;
        let context2: undefined | IMachineContext<any>;

        const id = mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onEnter((context) => context1 = context)],
            }
        });

        mgr.deleteMachine(id);
        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onEnter((context) => context2 = context)],
            }
        });

        expect(Object.is(context1, context2)).toBe(true);
    });
});


describe('General', () => {
    test('When a transition is triggered, then the machine correctly transitions state', () => {
        const trigger = createTrigger();
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        let curState: string = '';

        mgr.createMachine<'stateA' | 'stateB'>({
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
});


describe('State enter behavior', () => {
    test('When a state is entered, then all onEnter functions for that state are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onEnterFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];

        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [...onEnterFns.map(fn => onEnter(fn))],
            }
        });

        for (let fn of onEnterFns) {
            expect(fn).toHaveBeenCalled();
        }
    });


    test('When a state is entered, then all onRun functions for that state are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onRunFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];

        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [...onRunFns.map(fn => onRun(fn))],
            }
        });

        for (let fn of onRunFns) {
            expect(fn).toHaveBeenCalled();
        }
    });


    test('When a state is entered, then all onEnter functions for that state run before any onRun functions', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const fnCalls: string[] = [];
        const onRunFns = [
            () => fnCalls.push('onRun1'),
            () => fnCalls.push('onRun2'),
        ];
        const onEnterFns = [
            () => fnCalls.push('onEnter1'),
            () => fnCalls.push('onEnter2'),
            () => fnCalls.push('onEnter3'),
        ];

        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [
                    ...onRunFns.map(fn => onRun(fn)),
                    ...onEnterFns.map(fn => onEnter(fn)),
                ],
            }
        });

        expect(fnCalls.indexOf('onRun1')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onRun2')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onEnter1')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onEnter2')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onEnter3')).toBeGreaterThan(-1);

        expect(fnCalls.indexOf('onEnter1')).toBeLessThan(fnCalls.indexOf('onRun1'));
        expect(fnCalls.indexOf('onEnter1')).toBeLessThan(fnCalls.indexOf('onRun2'));
        expect(fnCalls.indexOf('onEnter2')).toBeLessThan(fnCalls.indexOf('onRun1'));
        expect(fnCalls.indexOf('onEnter2')).toBeLessThan(fnCalls.indexOf('onRun2'));
        expect(fnCalls.indexOf('onEnter3')).toBeLessThan(fnCalls.indexOf('onRun1'));
        expect(fnCalls.indexOf('onEnter3')).toBeLessThan(fnCalls.indexOf('onRun2'));
    });


    test('When a state is entered, then onEnter functions are run in the order listed', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const fnCalls: string[] = [];
        const onEnterFns = [
            () => fnCalls.push('onEnter1'),
            () => fnCalls.push('onEnter2'),
            () => fnCalls.push('onEnter3'),
        ];

        mgr.createMachine<'stateA'>({
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


    test('When a state is entered, then onRun functions are run in the order listed', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const fnCalls: string[] = [];
        const onRunFns = [
            () => fnCalls.push('onRun1'),
            () => fnCalls.push('onRun2'),
            () => fnCalls.push('onRun3'),
        ];

        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [...onRunFns.map(fn => onEnter(fn))],
            }
        });

        expect(fnCalls.indexOf('onRun1')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onRun2')).toBeGreaterThan(-1);
        expect(fnCalls.indexOf('onRun3')).toBeGreaterThan(-1);

        expect(fnCalls.indexOf('onRun1')).toBeLessThan(fnCalls.indexOf('onRun2'));
        expect(fnCalls.indexOf('onRun2')).toBeLessThan(fnCalls.indexOf('onRun3'));
    });


    test('When a state is entered, then NO onExit functions for that state are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onExitFn = jest.fn();

        mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onExit(onExitFn)],
            }
        });

        expect(onExitFn).not.toHaveBeenCalled();
    });


    test('When a state is entered, then NO onRun functions from any other state are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onRunStateB = jest.fn();
        const onRunStateC = jest.fn();
        const onRunStateD = jest.fn();

        mgr.createMachine<'stateA' | 'stateB' | 'stateC' | 'stateD'>({
            initState: 'stateA',
            states: {
                stateA: [],
                stateB: [onRun(onRunStateB)],
                stateC: [onRun(onRunStateC)],
                stateD: [onRun(onRunStateD)],
            }
        });

        expect(onRunStateB).not.toHaveBeenCalled();
        expect(onRunStateC).not.toHaveBeenCalled();
        expect(onRunStateD).not.toHaveBeenCalled();
    });


    test('When a state is entered, then NO onEnter functions from any other state are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onEnterStateB = jest.fn();
        const onEnterStateC = jest.fn();
        const onEnterStateD = jest.fn();

        mgr.createMachine<'stateA' | 'stateB' | 'stateC' | 'stateD'>({
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
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onExitFn = jest.fn();

        mgr.createMachine<'stateA'>({
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
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onExitFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]

        mgr.createMachine<'stateA' | 'stateB'>({
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
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const fnCalls: string[] = [];
        const onExitFns = [
            () => fnCalls.push('exitFn1'),
            () => fnCalls.push('exitFn2'),
            () => fnCalls.push('exitFn3'),
        ];

        mgr.createMachine<'stateA' | 'stateB'>({
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
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onEnterFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]

        mgr.createMachine<'stateA' | 'stateB'>({
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

    test('When a state is exited, then NO onRun functions for that state are called', () => {
        const trigger = createTrigger();
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onRunFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]

        mgr.createMachine<'stateA' | 'stateB'>({
            initState: 'stateA',
            states: {
                stateA: [
                    transitionOnTrigger(trigger, 'stateB'),
                    ...onRunFns.map(fn => onRun(fn))
                ],
                stateB: [],
            }
        });

        for (let fn of onRunFns) {
            expect(fn).toHaveBeenCalledTimes(1);
        }

        trigger.trigger();

        for (let fn of onRunFns) {
            expect(fn).toHaveBeenCalledTimes(1);
        }
    });


    test('When a state is exited, then NO onExit functions from any other state are run', () => {
        const trigger = createTrigger();
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onExitStateB = jest.fn();
        const onExitStateC = jest.fn();
        const onExitStateD = jest.fn();

        mgr.createMachine<'stateA' | 'stateB' | 'stateC' | 'stateD'>({
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


describe('Deleting a machine', () => {
    test('When a machine is deleted, onExit functions for the current state are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onExitFn = jest.fn();

        const id = mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [onExit(onExitFn)],
            }
        });

        mgr.deleteMachine(id);
        expect(onExitFn).toHaveBeenCalled();
    });


    test('When a machine is deleted, onEnd functions are run', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const onEndFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];

        const id = mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            },
            onEnd: [
                ...onEndFns
            ]
        });

        for (let fn of onEndFns) {
            expect(fn).not.toHaveBeenCalled();
        }

        mgr.deleteMachine(id);
        for (let fn of onEndFns) {
            expect(fn).toHaveBeenCalled();
        }
    });


    test('When a machine is deleted, machine ID is passed into all onMachineDestroyed listeners', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const listeners = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];
        listeners.forEach(fn => mgr.onMachineDestroyed(fn));

        const id = mgr.createMachine<'stateA'>({
            initState: 'stateA',
            states: {
                stateA: [],
            }
        });

        for (let fn of listeners) {
            expect(fn).not.toHaveBeenCalled();
        }

        mgr.deleteMachine(id);

        for (let fn of listeners) {
            expect(fn).toHaveBeenCalledWith(id);
        }
    });
});
