import { Machine } from '../../..';
import { createTimerFsmBlueprint } from './FsmBlueprints/TimerFsmBlueprint';

const trigger = document.getElementById('trigger') as HTMLInputElement,
    display = document.getElementById('display') as HTMLInputElement;

if (trigger === null || display === null) {
    throw new Error('Could not find necessary HTML elements');
}

const machine = new Machine();
machine.init(
    createTimerFsmBlueprint(trigger, display)
);
