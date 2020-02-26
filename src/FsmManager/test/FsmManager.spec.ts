import { BasicIdPool } from '../../IdPool';
import { FsmManager } from '../FsmManager';
import {
    onEnter,
} from '../../stateComponents';
import { IAuxDataContainer } from '../../IAuxDataContainer';
import { IMachineSPI } from '../../IMachineSPI';

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
        let context1: undefined | IMachineSPI<any>;
        let context2: undefined | IMachineSPI<any>;

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


describe('Deleting a machine', () => {

    test('When a machine is deleted, machine ID provider is passed into all onMachineDestroyed listeners', () => {
        const mgr = new FsmManager({ idPool: new BasicIdPool() });
        const listeners = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];
        listeners.forEach(
            fn => mgr.onMachineDestroyed(
                (provider: IAuxDataContainer) => fn(provider.id)));

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
