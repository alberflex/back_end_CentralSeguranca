import { IControleAcessoRepository } from "../data/repositories/ControleAcessoRepository";
import { conexaoMSSQL } from "../db";
import { ControleAcesso, ICadastroControleAcesso, IEdicaoControleAcesso } from "../interface/IControleAcesso";
import { dataAtualString } from "../utils/Data";
import { horaAtualBrasiliaString } from "../utils/Horario";
import sql from 'mssql';

export class ControleAcessoResource implements IControleAcessoRepository {

    public async cadastrarControleAcesso(dados: ICadastroControleAcesso): Promise<ControleAcesso> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("idVisitante", sql.Int, dados.idVisitante)
            .input("idPorteiroEntrada", sql.Int, dados.idPorteiroEntrada)
            .input("data_entrada", sql.Date, dataAtualString())
            .input("hora_entrada", sql.VarChar(8), horaAtualBrasiliaString())
            .input("objetivo", sql.VarChar(100), dados.objetivo)
            .input("placaVeiculo", sql.VarChar(10), dados.placaVeiculo)
            .input("numeroCartao", sql.VarChar(10), dados.numeroCartao)
            .input("responsavel", sql.VarChar(10), dados.responsavel)
            .query(`
                INSERT INTO cs_controleAcesso 
                    (idVisitante, idPorteiroEntrada, hora_entrada, data_entrada, objetivo, placaVeiculo, numeroCartao, responsavel)
                VALUES
                    (@idVisitante, @idPorteiroEntrada, @hora_entrada, @data_entrada, @objetivo, @placaVeiculo, @numeroCartao, @responsavel);
                
                SELECT id, idVisitante, idPorteiroEntrada, hora_entrada, data_entrada, objetivo, placaVeiculo, numeroCartao, responsavel
                FROM cs_controleAcesso
                WHERE id = SCOPE_IDENTITY();
            `);

        return resultado.recordset?.[0] as ControleAcesso;
    }

    public async editarControleAcesso(dados: IEdicaoControleAcesso, id: number): Promise<IEdicaoControleAcesso> {
        const pool = await conexaoMSSQL();

        const request = pool.request()
            .input("id", sql.Int, id)
            .input("idPorteiroEntrada", sql.Int, dados.idPorteiroEntrada)
            .input("objetivo", sql.VarChar(100), dados.objetivo)
            .input("placaVeiculo", sql.VarChar(10), dados.placaVeiculo)
            .input("numeroCartao", sql.VarChar(10), dados.numeroCartao)
            .input("responsavel", sql.VarChar(10), dados.responsavel?.slice(0, 10))
            .input("idPorteiroSaida", sql.Int, dados.idPorteiroSaida ?? null)
            .input("data_saida", sql.Date, dados.data_saida ?? null)
            .input("hora_saida", sql.VarChar(8), dados.hora_saida ?? null);

        const resultado = await request.query(`
            UPDATE cs_controleAcesso
            SET
                idPorteiroEntrada = @idPorteiroEntrada,
                objetivo = @objetivo,
                placaVeiculo = @placaVeiculo,
                numeroCartao = @numeroCartao,
                responsavel = @responsavel,
                idPorteiroSaida = ISNULL(@idPorteiroSaida, idPorteiroSaida),
                data_saida = ISNULL(@data_saida, data_saida),
                hora_saida = ISNULL(@hora_saida, hora_saida)
            OUTPUT INSERTED.*
            WHERE id = @id`);

        return resultado.recordset?.[0] as IEdicaoControleAcesso;
    }

    public async deletarControleAcesso(id: number): Promise<ControleAcesso> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request().input("id", sql.Int, id).query(`DELETE FROM cs_controleAcesso OUTPUT DELETED.* WHERE id = @id`);
        return resultado.recordset?.[0] as ControleAcesso;
    }

    public async listarTodosControleAcessos(dataInicio?: string, dataFim?: string): Promise<ControleAcesso[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();

        let filtroData = "";

        if (!dataInicio && !dataFim) {
            filtroData = "WHERE CAST(ca.data_entrada AS DATE) = CAST(GETDATE() AS DATE)";
        }
        else if (dataInicio && dataFim) {
            filtroData = "WHERE CAST(ca.data_entrada AS DATE) BETWEEN @dataInicio AND @dataFim";
            request.input("dataInicio", dataInicio);
            request.input("dataFim", dataFim);
        }

        const resultado = await request.query(`
                SELECT 
                    ca.id,
                    vi.nome as nomeVisitante,
                    pe1.nome as nomePorteiroEntrada,
                    pe2.nome as nomePorteiroSaida,
                    ca.data_entrada,
                    ca.hora_entrada,
                    ca.data_saida,
                    ca.hora_saida,
                    ca.objetivo,
                    ca.placaVeiculo,
                    ca.numeroCartao,
                    pe.nome as responsavel
                FROM cs_controleAcesso ca
                INNER JOIN cs_visitante vi ON vi.id = ca.idVisitante
                INNER JOIN cs_porteiro pe1 ON pe1.id = ca.idPorteiroEntrada
                LEFT JOIN cs_porteiro pe2 ON pe2.id = ca.idPorteiroSaida
                LEFT JOIN alb_pessoal pe ON pe.chapa = ca.responsavel ${filtroData};`);
        return resultado.recordset as ControleAcesso[];
    }

    public async listarControleAcessoPorId(id: number): Promise<ControleAcesso> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .query(`SELECT 
                    ca.id,
                    vi.nome as nomeVisitante,
                    pe1.nome as nomePorteiroEntrada,
                    pe2.nome as nomePorteiroSaida,
                    ca.data_entrada,
                    ca.hora_entrada,
                    ca.data_saida,
                    ca.hora_saida,
                    ca.objetivo,
                    ca.placaVeiculo,
                    ca.numeroCartao,
                    pe.nome as responsavel
                FROM cs_controleAcesso ca
                INNER JOIN cs_visitante vi ON vi.id = ca.idVisitante
                INNER JOIN cs_porteiro pe1 ON pe1.id = ca.idPorteiroEntrada
                LEFT JOIN cs_porteiro pe2 ON pe2.id = ca.idPorteiroSaida
                LEFT JOIN alb_pessoal pe ON pe.chapa = ca.responsavel WHERE ca.id = @id`);

        return resultado.recordset?.[0] as ControleAcesso;
    }

    public async contarAcessoEmAberto(): Promise<number> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().query(`SELECT COUNT(*) AS total FROM cs_controleAcesso WHERE data_saida IS NULL and hora_saida IS NULL`);
        return resultado.recordset[0]?.total ?? 0;
    }

    public async descobreVisitanteID(id: number): Promise<number> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().input("id", id).query(`SELECT idVisitante FROM cs_controleAcesso WHERE id = @id`);
        return resultado.recordset[0].idVisitante
    }
}