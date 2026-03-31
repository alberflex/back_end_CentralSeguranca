import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { BaseService } from "../helpers/BaseService";
import { ControleAcesso, ICadastroControleAcesso, IEdicaoControleAcesso } from "../interface/IControleAcesso";
import { ControleAcessoResource } from "../resources/ControleAcessoResource";
import { dataAtualString } from "../utils/Data";
import { ErroAplicacao } from "../utils/Erros";
import { horaAtualBrasiliaString } from "../utils/Horario";
import { LogService } from "./LogService";

export class ControleAcessoService extends BaseService {
    private controleAcessoResource: ControleAcessoResource;
    private logService: LogService;

    constructor() {
        super();

        this.controleAcessoResource = new ControleAcessoResource()
        this.logService = new LogService();
    }

    public cadastroAcesso(dados: ICadastroControleAcesso): Promise<ControleAcesso | null> {
        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_ACESSO,
            acao: EAcao.CADASTRO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosDepois: dados
        });

        return this.controleAcessoResource.cadastrarControleAcesso(dados);
    }

    public async deletarControleAcesso(id: number): Promise<ControleAcesso | null> {
        const buscarControleAcesso = await this.controleAcessoResource.listarControleAcessoPorId(id);
        if (!buscarControleAcesso) throw new ErroAplicacao("Controle acesso não encontrado", 404);

        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_ACESSO,
            acao: EAcao.EXCLUSAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosAntes: buscarControleAcesso
        });

        return this.controleAcessoResource.deletarControleAcesso(buscarControleAcesso.id);
    }

    public async listarTodosControlesAcessos(dataInicio?: string, dataFim?: string): Promise<ControleAcesso[]> {

        if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
            throw new ErroAplicacao("É necessário informar dataInicio e dataFim juntos.", 400);
        }

        return this.controleAcessoResource.listarTodosControleAcessos(dataInicio, dataFim);
    }

    public async listarControleAcessoPorID(id: number): Promise<ControleAcesso> {
        const buscarControleAcessoPorID = await this.controleAcessoResource.listarControleAcessoPorId(id);
        if (!buscarControleAcessoPorID) throw new ErroAplicacao(`Controle acesso por ID ${id} não encontrado`, 404);

        return buscarControleAcessoPorID;
    }

    public async editarControleAcesso(dados: IEdicaoControleAcesso, id: number): Promise<IEdicaoControleAcesso | null> {
        const dadosAtualizados: any = { ...dados };

        if (dados.idPorteiroSaida) {
            dadosAtualizados.data_saida = dataAtualString();
            dadosAtualizados.hora_saida = horaAtualBrasiliaString();
        } else {
            dadosAtualizados.data_saida = null;
            dadosAtualizados.hora_saida = null;
        }

        const controleAcessoEditado = this.controleAcessoResource.editarControleAcesso(dadosAtualizados, id)

        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_ACESSO,
            acao: EAcao.EDICAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosAntes: await this.controleAcessoResource.listarControleAcessoPorId(id),
            dadosDepois: controleAcessoEditado
        });

        return controleAcessoEditado
    }

    public contarAcessosEmAberto(): Promise<number> {
        return this.controleAcessoResource.contarAcessoEmAberto();
    }

    public async descobreVisitanteID(id: number): Promise<number | null> {
        const descobreVisitanteID = await this.controleAcessoResource.descobreVisitanteID(id);
        if (!descobreVisitanteID) throw new ErroAplicacao(`Controle acesso por ID ${id} não encontrado`, 404);

        return descobreVisitanteID;
    }
}