import { IIdPool } from './IIdPool';

enum IdState {
    inUse,
    reclaimed,
}

const DEFAULT_MAX_IDS = 4086;
// Note: Number.MAX_SAFE_INTEGER leads to heap overflow

interface IdListenerFn { (id: number): void }

/**
 * Manages a pool of IDs.
 *
 * NOTES
 * - Designed for use in entity-component systems.
 * - Free IDs can be requested via #provisionId().
 * - Each ID is essentially a mutex, which can be released using #releaseId().
 *
 * IMPLEMENTATION
 * - Non-generational.
 * - Optimized for minimum ID reuse.
 */
export class BasicIdPool implements IIdPool {
    private readonly _idFreeList: number[] = [];
    private readonly _idsInUse: Map<number, IdState> = new Map()
    private readonly _onReleaseIdListeners: IdListenerFn[] = [];
    private readonly _onReuseIdListeners: IdListenerFn[] = [];

    private readonly _maxCapacity: number;

    private _nFreeIds: number;
    private _nextFreeIdSlot: number = 0;

    /**
     * Creates a new BasicIdPool
     *
     * @param capacity Max number of IDs in pool. Must be a non-negative integer.
     */
    constructor(capacity?: number) {
        if (capacity !== undefined) {
            if (!Number.isInteger(capacity)) {
                throw new Error('maxIds must be an integer');
            }
            if (capacity < 0) {
                throw new Error('maxIds must be non-negative');
            }

            this._maxCapacity = capacity;
        } else {
            this._maxCapacity = DEFAULT_MAX_IDS;
        }

        this._nFreeIds = this._maxCapacity;
        for (let i = 0; i < this._maxCapacity; i++) {
            this._idFreeList.push(i)
        }
    }

    get usedCapacity(): number {
        return this._maxCapacity - this._nFreeIds;
    }

    get remainingCapacity(): number {
        return this._nFreeIds;
    }

    get maxCapacity(): number {
        return this._maxCapacity;
    }

    /**
     * Returns a free ID from the pool, then locks it until it is released via
     * #releaseId(). If the pool is empty, returns undefined instead.
     *
     * @returns A free ID, or undefined if no IDs are available.
     */
    provisionId(): number | undefined {
        if (this._nFreeIds <= 0) {
            return;
        }

        const id = this._idFreeList[this._nextFreeIdSlot];
        this._nextFreeIdSlot = (++this._nextFreeIdSlot) % this._maxCapacity;
        this._nFreeIds--;

        if (this._idsInUse.get(id) === IdState.reclaimed) {
            for (let fn of this._onReuseIdListeners) {
                fn(id);
            }
        }
        this._idsInUse.set(id, IdState.inUse);

        return id;
    }

    /**
     * Releases an ID, adding it back into the pool, then notifies all
     * onReleaseId listeners. Should be called when a given ID is no longer
     * needed.
     *
     * If the provided ID is not in use, this method will do nothing.
     *
     * @param id ID to reclaim.
     */
    releaseId(id: number): void {
        if (this._idsInUse.get(id) !== IdState.inUse) {
            return;
        }

        const slot = (this._nextFreeIdSlot + this._nFreeIds) % this._maxCapacity;

        this._idsInUse.set(id, IdState.reclaimed);
        this._idFreeList[slot] = id;
        this._nFreeIds++;

        for (let fn of this._onReleaseIdListeners) {
            fn(id);
        }
    }

    /**
     * Returns true if the provided ID is currently claimed.
     *
     * @param id ID to check.
     */
    isIdProvisioned(id: number): boolean {
        return this._idsInUse.get(id) === IdState.inUse;
    }

    /**
     * Iterates through all currently-provisioned IDs.
     */
    [Symbol.iterator](): Iterator<number, any, undefined> {
        let i: number = 0;

        const iterator = this._idsInUse[Symbol.iterator]();

        return {
            next: (...args: []): IteratorResult<number, any> => {
                let res: IteratorResult<[number, IdState], any>;

                while (true) {
                    res = iterator.next();
                    if (res.done || res.value[1] === IdState.inUse) {
                        break;
                    }
                }

                return {
                    value: res.value ? res.value[0] : undefined,
                    done: res.done,
                }
            }
        }
    }

    /**
     * Inserts callbacks, which will be triggered whenever an ID is released.
     * The ID released will be passed into the callbacks. This can be used to
     * free up resources or perform other entity-related cleanup.
     *
     * @param fns Array of callbacks.
     */
    onReleaseId(...fns: IdListenerFn[]): void {
        this._onReleaseIdListeners.push(...fns);
    }

    /**
     * Inserts callbacks, which will be triggered when an ID that was previously
     * in use is provisioned again. The ID being reused will be passed into the
     * callbacks. This can be used to free up resources, or perform
     * entity-related cleanup.
     *
     * @param fns Array of callbacks.
     */
    onReuseId(...fns: IdListenerFn[]): void {
        this._onReuseIdListeners.push(...fns);
    }
}
