import { Veiculo } from "../domain";
import { VeiculoResource } from "../resources/VeiculoResource";

export class VeiculoService {
    private veiculoResource: VeiculoResource;

    constructor() { this.veiculoResource = new VeiculoResource(); }

    public cadastrarVeiculo(veiculo: Veiculo): Promise<Veiculo | null> {
        return this.veiculoResource.cadastrarVeiculo(veiculo);
    }

    public deletarVeiculo(id: number): Promise<Veiculo | null> {
        return this.veiculoResource.deletarVeiculo(id);
    }

    public listarTodosVeiculos(): Promise<Veiculo[]> {
        return this.veiculoResource.listarTodosVeiculos();
    }

    public listarVeiculoPorId(id: number): Promise<Veiculo | null> {
        return this.veiculoResource.listarVeiculoPorId(id);
    }

    public alteraKilometragem(id: number, kilometragem: number): Promise<Veiculo | null> {
        return this.veiculoResource.alteraKilometragem(id, kilometragem);
    }
}