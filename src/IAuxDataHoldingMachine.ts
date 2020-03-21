/**
 * Machines have the ability to store a single auxillary property. This exists
 * to allow users to attach extra contextual data to the machine, and might take
 * the form of an object, an ID (perhaps in an entity-component system), or
 * some other field.
 *
 * This interface provides getter and setter methods for that data.
 */
export interface IAuxDataHoldingMachine<D> {
    getAuxillaryData(): D | undefined;
    setAuxillaryData(data: D): void;
}
