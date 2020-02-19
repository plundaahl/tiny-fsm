import { BasicIdPool } from '../IdPool';
import { MachineBlueprint } from '../types';
import { FsmManager } from '../FsmManager';
import {
    createTrigger,
    transitionOnTrigger,
} from './TransitionOnTrigger';
import { onEnter } from './OnEnter';
import { onRun } from './OnRun';
import { IMachineContext } from '../IMachineContext';

test('example', () => {
    const trigger = createTrigger();
    let curState: string = '';

    const blueprint: MachineBlueprint<'stateA' | 'stateB'> = {
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
    };

    const mgr = new FsmManager({ idPool: new BasicIdPool() });
    mgr.createMachine(blueprint);

    expect(curState).toBe('stateA');

    trigger.trigger();
    expect(curState).toBe('stateB');

    trigger.trigger();
    expect(curState).toBe('stateA');
});

test('hierarchical state machine', () => {
    const mgr = new FsmManager({ idPool: new BasicIdPool() });

    const trigger = createTrigger();
    let curState: string = '';
    let curSubState: string = '';
    let subStateChoice: 'stateB' | 'stateC' = 'stateB';

    const blueprint: MachineBlueprint<'stateA' | 'stateB' | 'stateC'> = {
        initState: 'stateA',
        states: {
            stateA: [
                onEnter(() => curState = 'stateA'),
                (parentMachine) => {
                    const id = mgr.createMachine<'wait' | 'decide'>({
                        initState: 'wait',
                        states: {
                            wait: [
                                onEnter(() => curSubState = 'started'),
                                transitionOnTrigger(trigger, 'decide'),
                            ],
                            decide: [onRun(() => parentMachine.transitionToState(subStateChoice))],
                        },
                        onEnd: [() => curSubState = 'terminated'],
                    });

                    return {
                        onExit: () => mgr.deleteMachine(id),
                    }
                }
            ],
            stateB: [
                onEnter(() => curState = 'stateB'),
                transitionOnTrigger(trigger, 'stateA'),
            ],
            stateC: [
                onEnter(() => curState = 'stateC'),
                transitionOnTrigger(trigger, 'stateA'),
            ],
        }
    };

    mgr.createMachine(blueprint);
    expect(curState).toBe('stateA');
    expect(curSubState).toBe('started');

    subStateChoice = 'stateB';
    trigger.trigger();
    expect(curSubState).toBe('terminated');
    expect(curState).toBe('stateB');

    trigger.trigger();
    expect(curState).toBe('stateA');
    expect(curSubState).toBe('started');

    subStateChoice = 'stateC';
    trigger.trigger();
    expect(curSubState).toBe('terminated');
    expect(curState).toBe('stateC');
});
