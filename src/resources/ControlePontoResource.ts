import { IControlePontoRepository } from "../data/repositories/ControlePontoRepository";
import { conexaoMSSQL } from "../db";
import { ControlePonto } from "../domain";
import { dataAtualString } from "../utils/Data";
import { horaAtualBrasiliaString } from "../utils/Horario";
import sql from 'mssql';

export class ControlePontoResource implements IControlePontoRepository {

    public async cadastrarControlePonto(idPorteiro: number, chapa: string): Promise<ControlePonto> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("chapa", sql.VarChar(10), chapa)
            .input("idPorteiroEntrada", sql.Int, idPorteiro)
            .input("horarioEntrada", sql.VarChar, horaAtualBrasiliaString())
            .input("data", sql.Date, dataAtualString())
            .query(`
          INSERT INTO cs_controlePonto (chapa, idPorteiroEntrada, horarioEntrada, data)
          OUTPUT INSERTED.*
          VALUES (@chapa, @idPorteiroEntrada, @horarioEntrada, @data)
        `);

        return resultado.recordset?.[0];
    }

    public async deletarControlePonto(id: number): Promise<ControlePonto> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .query(`DELETE FROM cs_controlePonto OUTPUT DELETED.* WHERE id = @id`);

        return resultado.recordset?.[0];
    }

    public async listarTodosPontos(dataInicio?: string, dataFim?: string): Promise<ControlePonto[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();

        let filtroData = "";

        if (!dataInicio && !dataFim) {
            filtroData = "WHERE CAST(cp.data AS DATE) = CAST(GETDATE() AS DATE)";
        }
        else if (dataInicio && dataFim) {
            filtroData = "WHERE CAST(cp.data AS DATE) BETWEEN @dataInicio AND @dataFim";
            request.input("dataInicio", dataInicio);
            request.input("dataFim", dataFim);
        }

        const resultado = await request.query(`
            SELECT 
                cp.id,
                COALESCE(pe.nome, ucp.nomeCompleto) AS nome_colaborador,
                po.nome AS nome_porteiro,
                cp.horarioEntrada,
                cp.horarioSaida,
                cp.data
            FROM cs_controlePonto cp
            LEFT JOIN alb_pessoal pe 
                ON LTRIM(RTRIM(cp.chapa)) = LTRIM(RTRIM(pe.chapa))
            LEFT JOIN cs_usuarioControlePonto ucp
                ON LTRIM(RTRIM(cp.chapa)) = LTRIM(RTRIM(ucp.chapa))
            INNER JOIN cs_porteiro po 
                ON po.id = cp.idPorteiroEntrada
            ${filtroData}
            ORDER BY cp.data DESC
        `);
        return resultado.recordset as ControlePonto[];
    }

    public async listarPontosPorID(id: number): Promise<ControlePonto> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().input("id", sql.Int, id).query(`SELECT * FROM cs_controlePonto where id = @id`);
        return resultado.recordset[0] as ControlePonto;
    }

    public async fecharPonto(id: number): Promise<ControlePonto> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .input("horarioSaida", sql.VarChar, horaAtualBrasiliaString())
            .query(`UPDATE cs_controlePonto SET horarioSaida = @horarioSaida OUTPUT INSERTED.* WHERE id = @id`);

        return resultado.recordset[0] as ControlePonto;
    }

    public async contarPontosAberto(): Promise<number> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request().query(`SELECT COUNT(*) AS total FROM cs_controlePonto WHERE horarioSaida IS NULL`);
        return resultado.recordset[0]?.total ?? 0;
    }
}