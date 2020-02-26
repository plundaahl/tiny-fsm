import { IMachineSPI } from '../../IMachineSPI';

type Trigger = {
    trigger: () => void,
    onTrigger: (fn: () => void) => void,
    clear: () => void,
};

const doNothing = () => undefined;

export const createTrigger = (): Readonly<Trigger> => {
    let triggerFn: () => void = doNothing;

    return {
        trigger: () => triggerFn(),
        onTrigger: (fn: () => void) => triggerFn = fn,
        clear: () => triggerFn = doNothing,
    }
}

export const transitionOnTrigger = <T extends string, D>(trigger: Trigger, state: T) => {
    return (machine: IMachineSPI<T, D>) => {
        trigger.onTrigger(() => machine.transitionToState(state));

        return {
            onExit: () => trigger.clear(),
        }
    };
};
