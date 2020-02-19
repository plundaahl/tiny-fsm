export interface IMachineContext<T extends string> {
    transitionToState(state: T | 'end'): void;
    id: number;
}
