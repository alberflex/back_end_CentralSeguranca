import { Veiculo, VeiculoUpdate } from "../domain";
import { VeiculoResource } from "../resources/VeiculoResource";
import { ErroAplicacao } from "../utils/Erros";

export class VeiculoService {
    private veiculoResource: VeiculoResource;

    constructor() { this.veiculoResource = new VeiculoResource(); }

    public cadastrarVeiculo(veiculo: Veiculo): Promise<Veiculo | null> {
        return this.veiculoResource.cadastrarVeiculo(veiculo);
    }

    public async deletarVeiculo(id: number): Promise<Veiculo> {
        const buscarVeiculo = await this.veiculoResource.listarVeiculoPorId(id);
        if (!buscarVeiculo) throw new ErroAplicacao("Controle veículo não encontrado", 404);

        return this.veiculoResource.deletarVeiculo(buscarVeiculo.id!);
    }

    public listarTodosVeiculos(placa?: string): Promise<Veiculo[]> {
        return this.veiculoResource.listarTodosVeiculos(placa);
    }

    public async listarVeiculoPorId(id: number): Promise<Veiculo> {
        const buscarVeiculoPorID = await this.veiculoResource.listarVeiculoPorId(id)
        if (!buscarVeiculoPorID) throw new ErroAplicacao(`Veículo por ID ${id} não encontrado`, 404);

        return buscarVeiculoPorID;
    }

    public alteraKilometragem(id: number, kilometragem: number): Promise<Veiculo | null> {
        return this.veiculoResource.alteraKilometragem(id, kilometragem);
    }

    public editarVeiculo(veiculo: VeiculoUpdate, id: number): Promise<VeiculoUpdate | null> {
        return this.veiculoResource.editarVeiculo(veiculo, id);
    }
}