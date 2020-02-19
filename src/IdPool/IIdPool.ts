export interface IIdPool extends Iterable<number> {
    [Symbol.iterator](): Iterator<number, any, undefined>;

    usedCapacity: number;
    remainingCapacity: number;
    maxCapacity: number;

    provisionId(): number | undefined;
    releaseId(id: number): void;
    isIdProvisioned(id: number): boolean;
}
