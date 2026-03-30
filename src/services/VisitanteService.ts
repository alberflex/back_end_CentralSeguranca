import { Visitante } from "../domain";
import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { BaseService } from "../helpers/BaseService";
import { IVisitante } from "../interface/IVisitante";
import { VisitanteResource } from "../resources/VisitanteResource";
import { removeArquivoRede } from "../utils/ArmazenamentoRede";
import { ErroAplicacao } from "../utils/Erros";
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
            nomeUsuario: this.user.nome,
            dadosDepois: visitante
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
            nomeUsuario: this.user.nome,
            dadosAntes: visitanteAtual,
            dadosDepois: visitanteEditado
        });

        if (visitante.caminho_foto_visitante && visitanteAtual.caminho_foto_visitante && visitante.caminho_foto_visitante !== visitanteAtual.caminho_foto_visitante) { removeArquivoRede(visitanteAtual.caminho_foto_visitante); }

        return visitanteEditado;
    }

    public deletarVisitante(id: number): Promise<Visitante | null> {
        const dadosExcluidos = this.visitanteResource.deletarVisitante(id);

        this.logService.cadastrarLog({
            tela: ETelas.VISITANTE,
            acao: EAcao.EXCLUSAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosAntes: dadosExcluidos
        });

        return dadosExcluidos;
    }

    public listarTodosVisitantes(): Promise<Visitante[]> {
        return this.visitanteResource.listarTodosVisitantes();
    }

    public listarVisitantePorId(id: number): Promise<Visitante | null> {
        return this.visitanteResource.listarVisitantePorId(id);
    }

    public async visitantesMaisPresentes(): Promise<any> {
        const dashboardVisitante = await this.visitanteResource.dashboardVisitante();

        if (!dashboardVisitante || dashboardVisitante.length === 0) {
            throw new ErroAplicacao("Informações dashboard nao encontradas", 404);
        }

        const agrupado = dashboardVisitante.reduce((acc, item) => {
            const chave = `${item.ano}-${item.mes}`;

            if (!acc[chave]) {
                acc[chave] = {
                    ano: item.ano,
                    mes: item.mes,
                    pessoas: []
                };
            }

            acc[chave].pessoas.push({
                nome: item.nome,
                total_visitantes: item.total_visitas
            });

            return acc;
        }, {} as Record<string, any>);

        return Object.values(agrupado);
    }

    public async selecionaPorCPF(CPF: string): Promise<Visitante | null> {
        return await this.visitanteResource.selecionaPorCPF(CPF);
    }
}