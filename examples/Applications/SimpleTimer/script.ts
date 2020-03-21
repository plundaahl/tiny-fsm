import { Machine } from '../../..';
import { createTimerBlueprint } from './Blueprints/TimerBlueprint';

const trigger = document.getElementById('trigger') as HTMLInputElement,
    display = document.getElementById('display') as HTMLInputElement;

if (trigger === null || display === null) {
    throw new Error('Could not find necessary HTML elements');
}

const machine = new Machine();
machine.runBlueprint(
    createTimerBlueprint(trigger, display)
);
