import { ControlePonto } from "../domain";
import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { BaseService } from "../helpers/BaseService";
import { ControlePontoResource } from "../resources/ControlePontoResource";
import { ErroAplicacao } from "../utils/Erros";
import { LogService } from "./Log";

export class ControlePontoService extends BaseService {
    private controlePontoResource: ControlePontoResource;
    private logService: LogService;

    constructor() {
        super();

        this.controlePontoResource = new ControlePontoResource()
        this.logService = new LogService();
    }

    public cadastrarControlePonto(idPorteiro: number, chapa: string): Promise<ControlePonto | null> {
        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_PONTO,
            acao: EAcao.CADASTRO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        return this.controlePontoResource.cadastrarControlePonto(idPorteiro, chapa);
    }

    public async deletarControlePonto(id: number): Promise<ControlePonto> {
        const buscarControlePonto = await this.controlePontoResource.listarPontosPorID(id);
        if (!buscarControlePonto) throw new ErroAplicacao("Controle ponto não encontrado", 404);

        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_PONTO,
            acao: EAcao.EXCLUSAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        return this.controlePontoResource.deletarControlePonto(buscarControlePonto.id);
    }


    public listarTodosPontos(dataInicio?: string, dataFim?: string): Promise<ControlePonto[]> {
        if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
            throw new ErroAplicacao("É necessário informar dataInicio e dataFim juntos.", 400);
        }

        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_PONTO,
            acao: EAcao.LISTAGEM,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        return this.controlePontoResource.listarTodosPontos(dataInicio, dataFim);
    }

    public async listarPontosPorID(id: number): Promise<ControlePonto> {
        const buscarPontoPorID = await this.controlePontoResource.listarPontosPorID(id);
        if (!buscarPontoPorID) throw new ErroAplicacao(`Controle ponto por ID ${id} não encontrado`, 404);

        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_PONTO,
            acao: EAcao.LISTAGEMPORID,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        return buscarPontoPorID;
    }

    public fecharPonto(id: number): Promise<ControlePonto | null> {
        return this.controlePontoResource.fecharPonto(id);
    }

    public contarSolicitacoesEmAberto(): Promise<number | null> {
        return this.controlePontoResource.contarPontosAberto();
    }
}