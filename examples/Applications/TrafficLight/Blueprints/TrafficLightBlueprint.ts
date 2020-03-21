import { IBlueprint } from '../../../..';
import { transitionOnClick } from '../../../Aspects';
import { powersLight } from '../Aspects/PowersLight';


/**
 * A simple factory function that returns the state machine blueprint for a
 * traffic light.
 */
export const createTrafficLightBlueprint = (
    trigger: HTMLElement,
    green: HTMLElement,
    amber: HTMLElement,
    red: HTMLElement,
): IBlueprint<'green' | 'amber' | 'red', undefined> => {
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
