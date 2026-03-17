import { IControleAcessoRepository } from "../data/repositories/ControleAcessoRepository";
import { conexaoMSSQL } from "../db";
import { ControleAcesso, ICadastroControleAcesso, IEdicaoControleAcesso } from "../interface/IControleAcesso";
import sql from 'mssql';

export class ControleAcessoResource implements IControleAcessoRepository {
    public async cadastrarControleAcesso(dados: ICadastroControleAcesso): Promise<ControleAcesso | null> {
        try {
            const pool = await conexaoMSSQL();

            const dataAtual = new Date();
            const data = dataAtual.toISOString().split("T")[0];
            const horaAtualBrasilia = new Date().toLocaleTimeString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour12: false
            });

            const resultado = await pool.request()
                .input("idVisitante", sql.Int, dados.idVisitante)
                .input("idPorteiroEntrada", sql.Int, dados.idPorteiroEntrada)
                .input("data_entrada", sql.Date, data)
                .input("hora_entrada", sql.VarChar(8), horaAtualBrasilia)
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

            return resultado.recordset[0] || null;

        } catch (error) {
            console.error("Erro ao cadastrar controle de acesso:", error);
            return null;
        }
    }

    public async editarControleAcesso(dados: IEdicaoControleAcesso, id: number): Promise<IEdicaoControleAcesso | null> {
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
        return resultado.recordset[0] || null;
    }

    public async deletarControleAcesso(id: number): Promise<ControleAcesso | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().input("id", sql.Int, id).query(`DELETE FROM cs_controleAcesso OUTPUT DELETED.* WHERE id = @id`);
            if (!resultado.recordset || resultado.recordset.length === 0) return null;

            return resultado.recordset[0];
        } catch (error: any) {
            console.error("Erro ao deletar controle de acesso:", error);
            return null;
        }
    }

    public async listarTodosControleAcessos(dataInicio?: string, dataFim?: string): Promise<ControleAcesso[]> {
        try {
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
            else {
                throw new Error("É necessário informar dataInicio e dataFim juntos.");
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
        } catch (error) {
            console.error("Erro ao listar controle acesso: ", error)
            return []
        }
    }

    public async listarControleAcessoPorId(id: number): Promise<ControleAcesso | null> {
        try {
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
            if (resultado.recordset.length > 0) return resultado.recordset[0] as ControleAcesso;
            return null;
        } catch (error) {
            console.error("Erro ao listar controle ponto");
            return null;
        }
    }

    public async fecharControleAcesso(id: number, idPorteiro: number): Promise<ControleAcesso | null> {
        const pool = await conexaoMSSQL();
        try {


            const resultado = await pool.request()
                .input("id", sql.Int, id)

                .query(`UPDATE cs_controleAcesso SET idPorteiroSaida = @idPorteiroSaida, data_saida = @data_saida, hora_saida = @hora_saida OUTPUT inserted.* WHERE id = @id`);
            if (resultado.recordset && resultado.recordset.length > 0) return resultado.recordset[0] as ControleAcesso;
            return null;
        } catch (error) {
            console.error("Erro ao fechar controle acesso:", error);
            return null;
        }
    }

    public async contarAcessoEmAberto(): Promise<number | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(`SELECT COUNT(*) AS total FROM cs_controleAcesso WHERE data_saida IS NULL and hora_saida IS NULL`);
            const total = resultado.recordset[0]?.total ?? 0;

            return total;
        } catch (error) {
            console.error("Erro ao contar acessos abertos:", error);
            return null;
        }
    }

    public async descobreVisitanteID(id: number): Promise<number | null> {
        try {
            const pool = await conexaoMSSQL();

            const resultado = await pool
                .request()
                .input("id", id)
                .query(`SELECT idVisitante FROM cs_controleAcesso WHERE id = @id`);

            return resultado.recordset.length > 0
                ? resultado.recordset[0].idVisitante
                : null;
        } catch (error) {
            console.error("Erro ao descobrir ID do visitante:", error);
            return null;
        }
    }
}