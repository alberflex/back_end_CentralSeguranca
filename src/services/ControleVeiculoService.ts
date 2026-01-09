import { ControleVeiculo } from "../domain";
import { IControleVeiculo, IEditacaoSolicitacao } from "../interface/IControleVeiculo";
import { IUsuario } from "../interface/IUsuario";
import { ControleVeiculoResource } from "../resources/ControleVeiculoResource";
import { VeiculoResource } from "../resources/VeiculoResource";

export class ControleVeiculoService {
    private controleVeiculo: ControleVeiculoResource;
    private veiculoResource: VeiculoResource;

    constructor() {
        this.controleVeiculo = new ControleVeiculoResource();
        this.veiculoResource = new VeiculoResource();
    }

    public async cadastrarControleVeiculo(cadastro: IControleVeiculo): Promise<ControleVeiculo | null> {
        const veiculo = await this.veiculoResource.listarVeiculoPorId(cadastro.idVeiculo);
        if (veiculo) {
            if (cadastro.km_inicial_veiculo <= veiculo.km_atual) return null;

            cadastro.km_inicial_veiculo = veiculo.km_atual;
            return this.controleVeiculo.cadastrarControleVeiculo(cadastro);
        }
        return null;
    }

    public async editarSolicitacao(id: number, dados: IControleVeiculo): Promise<ControleVeiculo | null> {
        const verificaSolicitacaoAberta = await this.controleVeiculo.verificaSolicitacaoAberta(id);
        if (verificaSolicitacaoAberta) {
            return this.controleVeiculo.editarSolicitacao(id, dados);
        }
        return null;
    }

    public deletarControleVeiculo(id: number): Promise<ControleVeiculo | null> {
        return this.controleVeiculo.deletarControleVeiculo(id);
    }

    public listarTodosControlesVeiculos(): Promise<ControleVeiculo[]> {
        return this.controleVeiculo.listarTodosControlesVeiculos();
    }

    public listarControlesVeiculosPorID(id: number): Promise<ControleVeiculo | null> {
        return this.controleVeiculo.listarControlesVeiculosPorID(id);
    }

    public contarSolicitacaoAberto(): Promise<number | null> {
        return this.controleVeiculo.contarSolicitacoesVeiculosEmAberto();
    }

    public async listarPessoal(termo?: string): Promise<IUsuario[] | null> {
        return this.controleVeiculo.listarPessoal(termo);
    }
}