export interface IMachine<T extends string> {
    transitionToState(state: T | 'end'): void;
    terminate(): void;
    id: number;
}
