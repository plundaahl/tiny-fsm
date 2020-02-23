import { IMachine } from '../../IMachine';

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

export const transitionOnTrigger = <T extends string>(trigger: Trigger, state: T) => {
    return (machine: IMachine<T>) => {
        trigger.onTrigger(() => machine.transitionToState(state));

        return {
            onExit: () => trigger.clear(),
        }
    };
};
