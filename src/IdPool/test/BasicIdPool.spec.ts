import { IIdPool } from '../IIdPool';
import { BasicIdPool } from '../BasicIdPool';

describe('provisionId()', () => {
    test('provisionId() should return a new number, so long as there are free ids', () => {
        const poolSize = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);
        const inUseIds: Set<number> = new Set();

        pool.remainingCapacity

        let curId: number | undefined;
        for (let i = 0; i < poolSize; i++) {
            curId = pool.provisionId();

            expect(typeof curId).toBe('number');
            expect(inUseIds.has(curId as number)).toBeFalsy();

            inUseIds.add(curId as number);
            curId = undefined;
        }

        expect(inUseIds.size).toBe(poolSize);
    });

    test('provisionId() should return undefined if we have used all available ids', () => {
        const poolSize = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);

        for (let i = 0; i < poolSize; i++) {
            pool.provisionId();
        }

        expect(pool.provisionId()).toBe(undefined);
    });

    test('provisionId() should reuse old ids if we have filled our maximum then reclaimed', () => {
        const poolSize = 10;
        const nIdsToReclaim = 3;
        const pool: IIdPool = new BasicIdPool(poolSize);

        const inUseIds: Array<number> = new Array();
        for (let i = 0; i < poolSize; i++) {
            inUseIds.push(pool.provisionId() as number);
        }

        const reclaimedIds: Set<number> = new Set();
        for (let i = 0; i < nIdsToReclaim; i++) {
            const id = inUseIds.shift();
            pool.releaseId(id as number);
            reclaimedIds.add(id as number);
        }

        for (let i = 0; i < nIdsToReclaim; i++) {
            const id = pool.provisionId();
            expect(reclaimedIds.has(id as number)).toBeTruthy();
        }
    });
});

describe('existsId()', () => {
    test('existsId() should return true for IDs returned from provisionId()', () => {
        const poolSize = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);
        const inUseIds: Set<number> = new Set();

        for (let i = 0; i < poolSize; i++) {
            inUseIds.add(pool.provisionId() as number);
        }

        for (let id of inUseIds) {
            expect(pool.isIdProvisioned(id)).toBeTruthy();
        }
    });

    test('existsId() should return false for IDs not yet emitted from provisionId()', () => {
        const poolSize = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);

        for (let i = 0; i < poolSize; i++) {
            expect(pool.isIdProvisioned(i)).toBeFalsy();
        }
    });

    test('existsId() should return false for IDs passed into releaseId()', () => {
        const poolSize = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);
        const provisionedIds: Set<number> = new Set();

        for (let i = 0; i < poolSize; i++) {
            provisionedIds.add(pool.provisionId() as number);
        }

        for (let id of provisionedIds) {
            pool.releaseId(id);
            expect(pool.isIdProvisioned(id)).toBeFalsy();
        }
    });
});

describe('releaseId()', () => {
    test('Given no free IDs, calling releaseId() then provisionId() should return the reclaimed ID', () => {
        const poolSize = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);

        let lastUsedId: number | undefined;
        for (let i = 0; i < poolSize; i++) {
            lastUsedId = pool.provisionId();
        }

        pool.releaseId(lastUsedId as number);
        expect(pool.provisionId()).toEqual(lastUsedId);
    });
});

describe('iterator', () => {
    test('Should iterate over all currently provisioned IDs', () => {
        const poolSize = 32;
        const idsToProvision = 10;
        const pool: IIdPool = new BasicIdPool(poolSize);
        const provisionedIds: Set<number> = new Set();

        for (let i = 0; i < idsToProvision; i++) {
            provisionedIds.add(pool.provisionId() as number);
        }

        let nEntriesInIterator = 0;
        for (let id of pool) {
            nEntriesInIterator++;
            expect(provisionedIds.has(id)).toBeTruthy();
        }

        expect(nEntriesInIterator).toBe(idsToProvision);
    });
});
