import { MachineBlueprint, stateComponents } from '../../../..';
import {
    disablesElement,
    transitionOnClick,
    transitionOnCondition,
    transitionAfterTimeout,
} from '../../../StateComponents';

const {
    onEnter,
    onExit,
} = stateComponents;

export const createTimerFsmBlueprint = (
    trigger: HTMLInputElement,
    display: HTMLInputElement,
): MachineBlueprint<'ready' | 'runningTimer' | 'updating' | 'stopped', undefined> => {

    let count: number;

    return {
        initState: 'ready',
        states: {
            ready: [
                onEnter(() => { display.value = '5'; }),
                onEnter(() => { trigger.innerHTML = 'start'; }),
                transitionOnClick(trigger, 'updating'),
                onExit(() => count = Math.floor(Number.parseInt(display.value))),
            ],
            updating: [
                onEnter(() => --count),
                onEnter(() => display.value = `${count}`),
                transitionOnCondition(() => count > 0, 'runningTimer', 'stopped'),
                disablesElement(display),
            ],
            runningTimer: [
                onEnter(() => { trigger.innerHTML = 'stop'; }),
                transitionAfterTimeout(1000, 'updating'),
                transitionOnClick(trigger, 'stopped'),
                disablesElement(display),
            ],
            stopped: [
                onEnter(() => { trigger.innerHTML = 'reset'; }),
                transitionOnClick(trigger, 'ready'),
                disablesElement(display),
            ],
        }
    };
};
