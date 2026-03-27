import { ILogRepository } from "../data/repositories/LogRepository";
import { conexaoMSSQL } from "../db";
import { Log } from "../domain";
import sql from 'mssql';

export class LogResource implements ILogRepository {

    public async cadastraLog(dados: { tela: string; acao: string; idUsuario: number; nomeUsuario?: string; }): Promise<boolean> {
        const pool = await conexaoMSSQL();
        const result = await pool.request()
            .input("tela", sql.VarChar, dados.tela)
            .input("acao", sql.VarChar, dados.acao)
            .input("idUsuario", sql.Int, dados.idUsuario)
            .input("nomeUsuario", sql.VarChar, dados.nomeUsuario)
            .query(`
            INSERT INTO cs_log 
                (tela, acao, idUsuario, nomeUsuario)
            VALUES
                (@tela, @acao, @idUsuario, @nomeUsuario);
        `);

        return result.rowsAffected[0] > 0;
    }

    public async listarTodosLogs(dataInicio?: string, dataFim?: string): Promise<Log[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();

        let filtroData = "";

        if (!dataInicio && !dataFim) {
            filtroData = "WHERE CAST(l.dataHora AS DATE) = CAST(GETDATE() AS DATE)";
        } else if (dataInicio && dataFim) {
            filtroData = "WHERE CAST(l.dataHora AS DATE) BETWEEN @dataInicio AND @dataFim";
            request.input("dataInicio", dataInicio);
            request.input("dataFim", dataFim);
        }
        const query = `
                SELECT 
                    l.id,
                    l.tela,
                    l.acao,
                    l.idUsuario,
                    l.nomeUsuario,
                    l.dataHora,
                    p.nome AS nomeUsuarioFK
                FROM cs_log l
                LEFT JOIN cs_porteiro p ON p.id = l.idUsuario
                ${filtroData}
                ORDER BY l.dataHora DESC;
            `;

        const resultado = await request.query(query);

        return resultado.recordset as Log[];
    }

    public async listarLogPorId(id: number): Promise<Log> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .query(`SELECT * FROM cs_log WHERE id = @id`);

        return resultado.recordset?.[0] as Log;
    }
} 