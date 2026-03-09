import { IControlePontoRepository } from "../data/repositories/ControlePontoRepository";
import { conexaoMSSQL } from "../db";
import { ControlePonto } from "../domain";
import sql from 'mssql';

export class ControlePontoResource implements IControlePontoRepository {

    public async cadastrarControlePonto(idPorteiro: number, chapa: string): Promise<ControlePonto | null> {
        try {
            const pool = await conexaoMSSQL();
            const dataAtual = new Date();
            const data = dataAtual.toISOString().split("T")[0];
            function horaAtualBrasilia(): string {
                const agora = new Date();
                const horaBrasilia = agora.toLocaleTimeString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour12: false
                });
                return horaBrasilia;
            }
            const resultado = await pool.request()
                .input("chapa", sql.VarChar(10), chapa)
                .input("idPorteiroEntrada", sql.Int, idPorteiro)
                .input("horarioEntrada", sql.VarChar, horaAtualBrasilia())
                .input("data", sql.Date, data)
                .query(`
          INSERT INTO cs_controlePonto (chapa, idPorteiroEntrada, horarioEntrada, data)
          OUTPUT INSERTED.*
          VALUES (@chapa, @idPorteiroEntrada, @horarioEntrada, @data)
        `);

            return resultado.recordset[0] || null;

        } catch (error) {
            console.error("Erro ao cadastrar controle de ponto:", error);
            return null;
        }
    }

    public async deletarControlePonto(id: number): Promise<ControlePonto | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`
                DELETE FROM cs_controlePonto
                OUTPUT DELETED.*
                WHERE id = @id
            `);

            if (!resultado.recordset || resultado.recordset.length === 0) {
                return null;
            }

            return resultado.recordset[0];
        } catch (error: any) {
            console.error("Erro ao deletar controle de ponto:", error);
            if (error.number === 547) {
                throw new Error("Não é possível deletar o registro: existem dependências relacionadas.");
            }

            return null;
        }
    }

    public async listarTodosPontos(dataInicio?: string, dataFim?: string): Promise<ControlePonto[]> {
        try {
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
            else {
                throw new Error("É necessário informar dataInicio e dataFim juntos.");
            }

            const resultado = await request.query(`
            SELECT 
                cp.id,
                pe.nome AS nome_colaborador,
                po.nome AS nome_porteiro,
                cp.horarioEntrada,
                cp.horarioSaida,
                cp.data
            FROM cs_controlePonto cp
            INNER JOIN alb_pessoal pe 
                ON LTRIM(RTRIM(cp.chapa)) = LTRIM(RTRIM(pe.chapa))
            INNER JOIN cs_porteiro po 
                ON po.id = cp.idPorteiroEntrada
            ${filtroData}
            ORDER BY cp.data DESC
        `);
            return resultado.recordset as ControlePonto[];
        } catch (error) {
            console.error("Erro ao listar controle ponto: ", error);
            return [];
        }
    }

    public async listarPontosPorID(id: number): Promise<ControlePonto | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`SELECT * FROM cs_controlePonto where id = @id`);

            if (resultado.recordset.length > 0) return resultado.recordset[0] as ControlePonto;

            return null;
        } catch (error) {
            console.error("Erro ao listar controle ponto");
            return null;
        }
    }

    public async fecharPonto(id: number): Promise<ControlePonto | null> {
        try {
            function horaAtualBrasilia(): string {
                const agora = new Date();
                const horaBrasilia = agora.toLocaleTimeString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour12: false
                });
                return horaBrasilia;
            }

            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .input("horarioSaida", sql.VarChar, horaAtualBrasilia())
                .query(`
        UPDATE cs_controlePonto
        SET horarioSaida = @horarioSaida
        OUTPUT INSERTED.*
        WHERE id = @id
    `);

            return resultado.recordset[0] || null;
        } catch (error) {
            console.error("Erro ao listar controle ponto");
            return null;
        }
    }

    public async contarPontosAberto(): Promise<number | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(`
            SELECT COUNT(*) AS total FROM cs_controlePonto WHERE horarioSaida IS NULL`);
            const total = resultado.recordset[0]?.total ?? 0;

            return total;
        } catch (error) {
            console.error("Erro ao contar pontos abertos:", error);
            return null;
        }
    }
}