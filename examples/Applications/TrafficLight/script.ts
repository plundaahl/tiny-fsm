import { Machine } from '../../..';
import { createTrafficLightBlueprint } from './Blueprints/TrafficLightBlueprint';

const button = document.getElementById('advance'),
    greenLight = document.getElementById('green'),
    amberLight = document.getElementById('amber'),
    redLight = document.getElementById('red');

if (button === null
    || greenLight === null
    || amberLight === null
    || redLight === null
) {
    throw new Error('Could not find necessary HTML elements');
}

const machine = new Machine();

machine.runBlueprint(
    createTrafficLightBlueprint(
        button,
        greenLight,
        amberLight,
        redLight,
    ),
);
