export interface IAuxDataContainer<D> {
    getAuxillaryData(): D | undefined;
    setAuxillaryData(data: D): void;
}
