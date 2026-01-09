import { IControleAcessoRepository } from "../data/repositories/ControleAcessoRepository";
import { conexaoMSSQL } from "../db";
import { ControleAcesso, ICadastroControleAcesso } from "../interface/IControleAcesso";
import sql from 'mssql';

export class ControleAcessoResource implements IControleAcessoRepository {
    public async cadastrarControlePonto(dados: ICadastroControleAcesso): Promise<ControleAcesso | null> {
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
                .input("idVisitante", sql.Int, dados.idVisitante)
                .input("idPorteiroEntrada", sql.Int, dados.idPorteiroEntrada)
                .input("data_entrada", sql.Date, data)
                .input("hora_entrada", sql.VarChar, horaAtualBrasilia())
                .input("objetivo", sql.VarChar(100), dados.objetivo)
                .input("placaVeiculo", sql.VarChar(10), dados.placaVeiculo)
                .input("numeroCartao", sql.VarChar(10), dados.numeroCartao)
                .input("responsavel", sql.VarChar(10), dados.responsavel)
                .query(`INSERT INTO cs_controleAcesso (idVisitante, idPorteiroEntrada, hora_entrada, data_entrada, objetivo, placaVeiculo, numeroCartao, responsavel)
                        OUTPUT INSERTED.*
                        VALUES (@idVisitante, @idPorteiroEntrada, @hora_entrada, @data_entrada, @objetivo, @placaVeiculo, @numeroCartao, @responsavel)
        `);

            return resultado.recordset[0] || null;
        } catch (error) {
            console.error("Erro ao cadastrar controle de acesso:", error);
            return null;
        }
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

    public async listarTodosControleAcessos(): Promise<ControleAcesso[]> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(`
            SELECT 
               ca.id,
               vi.nome as nomeVisitante,
               po.nome as nomePorteiroEntrada,
               po.nome as nomePorteiroSaida,
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
           INNER JOIN cs_porteiro po ON po.id = ca.idPorteiroEntrada
           INNER JOIN alb_pessoal pe ON pe.chapa = ca.responsavel;`);
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
                            po.nome as nomePorteiroEntrada,
                            po.nome as nomePorteiroSaida,
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
                        INNER JOIN alb_pessoal pe ON pe.chapa = ca.responsavel
                        INNER JOIN cs_porteiro po ON po.id = ca.idPorteiroEntrada WHERE ca.id = @id`);
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
            function horaAtualBrasilia(): string {
                const agora = new Date();
                return agora.toLocaleTimeString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour12: false
                });
            }

            const dataAtual = new Date();
            const data = dataAtual.toISOString().split("T")[0];

            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .input("idPorteiroSaida", sql.Int, idPorteiro)
                .input("hora_saida", sql.VarChar(8), horaAtualBrasilia())
                .input("data_saida", sql.Date, data)
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