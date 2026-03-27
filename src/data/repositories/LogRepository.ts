import { Log } from "../../domain/entities/Log";

export interface ILogRepository {
    cadastraLog(dados: Log): Promise<boolean>;
    listarTodosLogs(dataInicio?: string, dataFim?: string): Promise<Log[]>;
    listarLogPorId(id: number): Promise<Log>;
}