import { Visitante } from "../domain";
import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { BaseService } from "../helpers/BaseService";
import { IVisitante } from "../interface/IVisitante";
import { VisitanteResource } from "../resources/VisitanteResource";
import { removeArquivoRede } from "../utils/ArmazenamentoRede";
import { LogService } from "./Log";

export class VisitanteService extends BaseService {
    private visitanteResource: VisitanteResource;
    private logService: LogService;

    constructor() {
        super();

        this.visitanteResource = new VisitanteResource()
        this.logService = new LogService();
    }

    public async cadastrarVisitante(visitante: IVisitante): Promise<IVisitante | null> {
        this.logService.cadastrarLog({
            tela: ETelas.VISITANTE,
            acao: EAcao.CADASTRO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        return this.visitanteResource.cadastrarVisitante(visitante);
    }

    public async editarVisitante(visitante: IVisitante, id: number): Promise<Visitante | null> {
        const visitanteAtual = await this.visitanteResource.listarVisitantePorId(id);
        if (!visitanteAtual) throw new Error("Visitante não encontrado");

        const visitanteEditado = await this.visitanteResource.editarVisitante(visitante, id);
        if (!visitanteEditado) return null;

        this.logService.cadastrarLog({
            tela: ETelas.VISITANTE,
            acao: EAcao.EDICAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        if (visitante.caminho_foto_visitante && visitanteAtual.caminho_foto_visitante && visitante.caminho_foto_visitante !== visitanteAtual.caminho_foto_visitante) { removeArquivoRede(visitanteAtual.caminho_foto_visitante); }

        return visitanteEditado;
    }

    public deletarVisitante(id: number): Promise<Visitante | null> {
        this.logService.cadastrarLog({
            tela: ETelas.VISITANTE,
            acao: EAcao.EXCLUSAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });

        return this.visitanteResource.deletarVisitante(id);
    }

    public listarTodosVisitantes(): Promise<Visitante[]> {
        this.logService.cadastrarLog({
            tela: ETelas.VISITANTE,
            acao: EAcao.LISTAGEM,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });
        return this.visitanteResource.listarTodosVisitantes();
    }

    public listarVisitantePorId(id: number): Promise<Visitante | null> {
        this.logService.cadastrarLog({
            tela: ETelas.VISITANTE,
            acao: EAcao.LISTAGEMPORID,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome
        });
        return this.visitanteResource.listarVisitantePorId(id);
    }

    public async selecionaPorCPF(CPF: string): Promise<Visitante | null> {
        return await this.visitanteResource.selecionaPorCPF(CPF);
    }
}