export interface IAuxDataHoldingMachine<D> {
    getAuxillaryData(): D | undefined;
    setAuxillaryData(data: D): void;
}
