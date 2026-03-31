import { ILogRepository } from "../data/repositories/LogRepository";
import { conexaoMSSQL } from "../db";
import { Log } from "../domain";
import sql from 'mssql';

export class LogResource implements ILogRepository {

    public async cadastraLog(dados: { mensagem: string, dadosAntes?: any, dadosDepois?: any }): Promise<boolean> {
        const pool = await conexaoMSSQL();
        const result = await pool.request()
            .input("mensagem", sql.VarChar, dados.mensagem)
            .input("dadosAntes", sql.NVarChar, JSON.stringify(dados.dadosAntes ?? null))
            .input("dadosDepois", sql.NVarChar, JSON.stringify(dados.dadosDepois ?? null))
            .query(`
            INSERT INTO cs_log 
                (mensagem, dadosAntes, dadosDepois)
            VALUES
                (@mensagem, @dadosAntes, @dadosDepois);
        `);

        return result.rowsAffected[0] > 0;
    }

    public async listarTodosLogs(): Promise<Log[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();
        const query = `
        SELECT 
            l.id,
            l.mensagem,
            l.dadosAntes,
            l.dadosDepois
        FROM cs_log l ORDER BY l.id DESC; `;

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