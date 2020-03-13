import { MachineBlueprint } from '../../../..';
import { transitionOnClick } from '../../../StateComponents';
import { powersLight } from '../StateComponents/PowersLight';


/**
 * A simple factory function that returns the state machine blueprint for a
 * traffic light.
 */
export const createTrafficLightFsmBlueprint = (
    trigger: HTMLElement,
    green: HTMLElement,
    amber: HTMLElement,
    red: HTMLElement,
): MachineBlueprint<'green' | 'amber' | 'red', undefined> => {
    return {
        initState: 'green',
        states: {
            green: [
                transitionOnClick(trigger, 'amber'),
                powersLight(green),
            ],
            amber: [
                transitionOnClick(trigger, 'red'),
                powersLight(amber),
            ],
            red: [
                transitionOnClick(trigger, 'green'),
                powersLight(red),
            ],
        }
    }
}
