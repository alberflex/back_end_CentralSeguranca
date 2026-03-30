import { Log } from "../domain";
import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { LogResource } from "../resources/LogResource";
import { dataAtualString } from "../utils/Data";
import { ErroAplicacao } from "../utils/Erros";
import { horaAtualBrasiliaString } from "../utils/Horario";

interface ILogParams {
    tela: ETelas;
    acao: EAcao;
    idUsuario: number;
    nomeUsuario?: string;
    dadosAntes?: any;
    dadosDepois?: any;
}

export class LogService {
    private logResource: LogResource;

    constructor() { this.logResource = new LogResource() }

    public montarMensagem({ tela, acao, nomeUsuario }: ILogParams): string {
        return `Usuário ${nomeUsuario ?? "N/A"} realizou ${acao} na tela ${tela} em ${dataAtualString()} às ${horaAtualBrasiliaString()}`;
    }

    public async cadastrarLog(params: ILogParams): Promise<boolean> {
        const mensagem = this.montarMensagem({
            ...params,
            nomeUsuario: params.nomeUsuario ?? "N/A"
        });

        return await this.logResource.cadastraLog({
            ...params,
            mensagem
        } as any);
    }

    public async listarTodosLogs(dataInicio?: string, dataFim?: string): Promise<Log[]> {
        if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
            throw new ErroAplicacao("É necessário informar dataInicio e dataFim juntos.", 400);
        }
        return this.logResource.listarTodosLogs(dataInicio, dataFim);
    }

    public async listarLogPorID(id: number): Promise<Log> {
        const buscarLogPorID = await this.logResource.listarLogPorId(id);
        if (!buscarLogPorID) throw new ErroAplicacao(`Log por ID ${id} não encontrado`, 404);

        return buscarLogPorID;
    }
}