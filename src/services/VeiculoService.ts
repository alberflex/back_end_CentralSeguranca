import { Veiculo, VeiculoUpdate } from "../domain";
import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { BaseService } from "../helpers/BaseService";
import { VeiculoResource } from "../resources/VeiculoResource";
import { ErroAplicacao } from "../utils/Erros";
import { LogService } from "./Log";

export class VeiculoService extends BaseService {
    private veiculoResource: VeiculoResource;
    private logService: LogService;

    constructor() {
        super();

        this.veiculoResource = new VeiculoResource();
        this.logService = new LogService();
    }

    public cadastrarVeiculo(veiculo: Veiculo): Promise<Veiculo | null> {
        this.logService.cadastrarLog({
            tela: ETelas.VEICULO,
            acao: EAcao.CADASTRO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosDepois: veiculo
        });
        return this.veiculoResource.cadastrarVeiculo(veiculo);
    }

    public async veiculosMaisUtilizados(): Promise<any> {
        const dashboardVeiculo = await this.veiculoResource.veiculosMaisUtilizados();

        if (!dashboardVeiculo || dashboardVeiculo.length === 0) {
            throw new ErroAplicacao("Informações dashboard nao encontradas", 404);
        }

        const agrupado = dashboardVeiculo.reduce((acc, item) => {
            const chave = `${item.ano}-${item.mes}`;

            if (!acc[chave]) {
                acc[chave] = {
                    ano: item.ano,
                    mes: item.mes,
                    veiculos: []
                };
            }

            acc[chave].veiculos.push({
                placa: item.placa,
                total_utilizacoes: item.total_utilizacoes
            });

            return acc;
        }, {} as Record<string, any>);

        return Object.values(agrupado);
    }

    public async deletarVeiculo(id: number): Promise<Veiculo> {
        const buscarVeiculo = await this.veiculoResource.listarVeiculoPorId(id);
        if (!buscarVeiculo) throw new ErroAplicacao("Controle veículo não encontrado", 404);

        this.logService.cadastrarLog({
            tela: ETelas.VEICULO,
            acao: EAcao.EXCLUSAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosAntes: buscarVeiculo
        });

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

    public async editarVeiculo(veiculo: VeiculoUpdate, id: number): Promise<VeiculoUpdate | null> {
        const dadosEditados = await this.veiculoResource.editarVeiculo(veiculo, id)

        this.logService.cadastrarLog({
            tela: ETelas.VEICULO,
            acao: EAcao.EDICAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosAntes: await this.veiculoResource.listarVeiculoPorId(id),
            dadosDepois: dadosEditados
        });

        return dadosEditados;
    }
}