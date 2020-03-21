import { IBlueprint } from '../IBlueprint';
import { IMachine } from '../IMachine';
import { MachineCore } from './MachineCore';

export class Machine<D> implements IMachine<D> {

    private readonly spi: MachineCore<string, D>;

    constructor() {
        this.spi = new MachineCore();
    }

    init<S extends string>(blueprint: IBlueprint<S, D>, auxillaryData?: D): void {
        return this.spi.init(blueprint, auxillaryData);
    }

    isInitialized(): boolean {
        return this.spi.isInitialized();
    }

    terminate(): void {
        return this.spi.terminate();
    }

    getAuxillaryData(): D | undefined {
        return this.spi.getAuxillaryData();
    }

    setAuxillaryData(data: D): void {
        return this.spi.setAuxillaryData(data);
    }
}
