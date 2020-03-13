import { Machine } from '../../..';
import { createTrafficLightFsmBlueprint } from './FsmBlueprints/TrafficLightFsmBlueprint';

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

machine.init(
    createTrafficLightFsmBlueprint(
        button,
        greenLight,
        amberLight,
        redLight,
    ),
);
