import { ControleAcesso, ICadastroControleAcesso, IEdicaoControleAcesso } from "../interface/IControleAcesso";
import { ControleAcessoResource } from "../resources/ControleAcessoResource";

export class ControleAcessoService {
    private controleAcessoResource: ControleAcessoResource;

    constructor() { this.controleAcessoResource = new ControleAcessoResource() }

    public cadastroAcesso(dados: ICadastroControleAcesso): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.cadastrarControleAcesso(dados);
    }

    public deletarControleAcesso(id: number): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.deletarControleAcesso(id);
    }

    public listarTodosControlesAcessos(dataInicio?: string, dataFim?: string): Promise<ControleAcesso[]> {
        return this.controleAcessoResource.listarTodosControleAcessos(dataInicio, dataFim);
    }

    public listarControleAcessoPorID(id: number): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.listarControleAcessoPorId(id);
    }

    public fecharControleAcesso(id: number, idPorteiro: number): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.fecharControleAcesso(id, idPorteiro);
    }

    public async editarControleAcesso(dados: IEdicaoControleAcesso, id: number): Promise<IEdicaoControleAcesso | null> {

        function horaAtualBrasilia(): string {
            const agora = new Date();
            return agora.toLocaleTimeString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour12: false
            });
        }
        const dataAtual = new Date();
        const data = dataAtual.toISOString().split("T")[0];

        const dadosAtualizados: any = { ...dados };

        if (dados.idPorteiroSaida) {
            dadosAtualizados.data_saida = data;
            dadosAtualizados.hora_saida = horaAtualBrasilia();
        } else {
            dadosAtualizados.data_saida = null;
            dadosAtualizados.hora_saida = null;
        }

        return this.controleAcessoResource.editarControleAcesso(dadosAtualizados, id);
    }

    public contarAcessosEmAberto(): Promise<number | null> {
        return this.controleAcessoResource.contarAcessoEmAberto();
    }

    public async descobreVisitanteID(id: number): Promise<number | null> {
        return await this.controleAcessoResource.descobreVisitanteID(id);
    }
}