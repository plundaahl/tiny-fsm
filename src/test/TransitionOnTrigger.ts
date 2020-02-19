import { IMachineContext } from '../IMachineContext';

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
    return (machine: IMachineContext<T>) => {
        trigger.onTrigger(() => machine.transitionToState(state));

        return {
            onExit: () => trigger.clear(),
        }
    };
};
