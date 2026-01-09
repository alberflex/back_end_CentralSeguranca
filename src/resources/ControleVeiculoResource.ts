import { IControleVeiculoRepository } from "../data/repositories/ControleVeiculoRepository";
import { conexaoMSSQL } from "../db";
import { ControleVeiculo } from "../domain";
import { IControleVeiculo } from "../interface/IControleVeiculo";
import { IUsuario } from "../interface/IUsuario";
import sql from 'mssql';

export class ControleVeiculoResource implements IControleVeiculoRepository {
    public async cadastrarControleVeiculo(cadastro: IControleVeiculo): Promise<ControleVeiculo | null> {
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
                .input("idVeiculo", sql.Numeric, cadastro.idVeiculo)
                .input("destino", sql.VarChar, cadastro.destino)
                .input("data_solicitacao", sql.Date, data)
                .input("horario_saida", sql.VarChar, horaAtualBrasilia())
                .input("km_inicial_veiculo", sql.Numeric, cadastro.km_inicial_veiculo)
                .input("idPorteiroSaida", sql.Int, cadastro.idPorteiroSaida)
                .input("idResponsavel", sql.VarChar, cadastro.idResponsavel)
                .input("localizacao", sql.VarChar, cadastro.localizacao)
                .input("idResponsavelAutorizacao", sql.VarChar, cadastro.idResponsavelAutorizacao)
                .query(`INSERT INTO cs_controleVeiculo 
                        (   idVeiculo,
                            destino,
                            data_solicitacao,
                            horario_saida,
                            km_inicial_veiculo,
                            idPorteiroSaida,
                            idResponsavel,
                            localizacao,
                            idResponsavelAutorizacao
                        )
                        OUTPUT INSERTED.*
                        VALUES 
                        (
                            @idVeiculo,
                            @destino,
                            @data_solicitacao,
                            @horario_saida,
                            @km_inicial_veiculo,
                            @idPorteiroSaida,
                            @idResponsavel,
                            @localizacao,
                            @idResponsavelAutorizacao
                        )
                    `);
            return resultado.recordset[0] as ControleVeiculo || null;
        } catch (error) {
            console.error("Erro ao cadastrar controle de ponto:", error);
            return null;
        }
    }

    public async deletarControleVeiculo(id: number): Promise<ControleVeiculo | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`
                DELETE FROM cs_controleVeiculo
                OUTPUT DELETED.*
                WHERE id = @id
            `);

            if (!resultado.recordset || resultado.recordset.length === 0) {
                return null;
            }
            return resultado.recordset[0];
        } catch (error: any) {
            console.error("Erro ao deletar controle de veiculo:", error);
            return null;
        }
    }

    public async listarTodosControlesVeiculos(): Promise<ControleVeiculo[]> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(
                `SELECT 
                cv.id,
                ve.placa,
                cv.destino,
                cv.data_solicitacao,
                cv.horario_saida,
                cv.km_inicial_veiculo,
                cv.data_chegada,
                cv.horario_chegada,
                cv.km_final_veiculo,
                po.nome AS nome_porteiro_saida,
                pe.nome AS nome_responsavel,
                cv.localizacao,
                po.nome AS nome_porteiro_entrada,
                pe.nome AS nome_responsavel_autorizacao
            FROM cs_controleVeiculo cv
            INNER JOIN cs_veiculo ve 
                ON cv.idVeiculo = ve.id
            INNER JOIN cs_porteiro po 
                ON cv.idPorteiroSaida = po.id
            INNER JOIN alb_pessoal pe 
                ON cv.idResponsavel = pe.chapa
            ORDER BY
                CASE 
                    WHEN cv.data_chegada IS NULL 
                    AND cv.horario_chegada IS NULL THEN 0
                    ELSE 1
                END,
                cv.data_solicitacao DESC,
                cv.horario_saida DESC;`
            )
            return resultado.recordset as ControleVeiculo[];
        } catch (error) {
            console.error("Erro ao listar controles veiculos: ", error)
            return []
        }
    }

    public async listarControlesVeiculosPorID(id: number): Promise<ControleVeiculo | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`SELECT * FROM cs_controleVeiculo where id = @id`);

            if (resultado.recordset.length > 0) return resultado.recordset[0] as ControleVeiculo;

            return null;
        } catch (error) {
            console.error("Erro ao listar controle de veiculo");
            return null;
        }
    }

    public async editarSolicitacao(id: number, dados: IControleVeiculo): Promise<ControleVeiculo | null> {
        try {
            const dataAtual = new Date();
            const data = dataAtual.toISOString().split("T")[0];

            function horaAtualBrasilia(): string {
                const agora = new Date();
                const horaBrasilia = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
                return horaBrasilia;
            }

            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .input("destino", sql.VarChar, dados.destino)
                .input("idPorteiroSaida", sql.Int, dados.idPorteiroSaida)
                .input("idResponsavel", sql.VarChar, dados.idResponsavel)
                .input("localizacao", sql.VarChar, dados.localizacao)
                .input("idResponsavelAutorizacao", sql.VarChar, dados.idResponsavelAutorizacao)
                .input("data_chegada", sql.Date, data)
                .input("horario_chegada", sql.VarChar, horaAtualBrasilia())
                .input("km_final_veiculo", sql.Numeric, dados.km_final_veiculo)
                .input("idPorteiroEntrada", sql.Int, dados.idPorteiroEntrada)

                .query(`UPDATE cs_controleVeiculo 
                        SET destino = @destino, 
                        idPorteiroSaida = @idPorteiroSaida,
                        idResponsavel = @idResponsavel, 
                        localizacao = @localizacao,
                        idResponsavelAutorizacao = @idResponsavelAutorizacao,
                        data_chegada = @data_chegada,
                        horario_chegada = @horario_chegada,
                        km_final_veiculo = @km_final_veiculo,
                        idPorteiroEntrada = @idPorteiroEntrada
                        OUTPUT INSERTED.*
                        WHERE id = @id`);
            if (!resultado.recordset[0]) return null;
            return resultado.recordset[0];
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public async verificaSolicitacaoAberta(id: number): Promise<ControleVeiculo | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`SELECT * FROM cs_controleVeiculo WHERE id = @id AND horario_chegada IS NULL AND data_chegada IS NULL`);

            if (resultado.recordset.length > 0) return resultado.recordset[0] as ControleVeiculo;

            return null;
        } catch (error) {
            console.log("Erro ao verificar solicitação aberta: ", error);
            return null;
        }
    }

    public async fecharSolicitacao(id: number, idPorteiroEntrada: number, kmFinal: number): Promise<ControleVeiculo | null> {
        try {
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

            const pool = await conexaoMSSQL();

            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .input("horario_chegada", sql.VarChar, horaAtualBrasilia())
                .input("data_chegada", sql.Date, data)
                .input("km_final_veiculo", sql.Numeric, kmFinal)
                .input("idPorteiroEntrada", sql.Int, idPorteiroEntrada)
                .query(`
                UPDATE cs_controleVeiculo
                SET horario_chegada = @horario_chegada, 
                    data_chegada = @data_chegada, 
                    km_final_veiculo = @km_final_veiculo, 
                    idPorteiroEntrada = @idPorteiroEntrada
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

            if (!resultado.recordset[0]) {
                console.log("Nenhum registro foi alterado.");
                return null;
            }
            return resultado.recordset[0];
        } catch (error) {
            console.error("Erro ao fechar controle de veiculo:", error);
            return null;
        }
    }

    public async contarSolicitacoesVeiculosEmAberto(): Promise<number | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(`
            SELECT COUNT(*) AS total FROM cs_controleVeiculo WHERE data_chegada IS NULL and horario_chegada IS NULL;`);
            const total = resultado.recordset[0]?.total ?? 0;

            return total;
        } catch (error) {
            console.error("Erro ao contar pontos abertos:", error);
            return null;
        }
    }

    public async listarPessoal(termo?: string): Promise<IUsuario[] | null> {
        try {
            const pool = await conexaoMSSQL();

            let query = `SELECT * FROM alb_pessoal`;

            if (termo && termo.trim() !== "") {
                query += ` WHERE nome LIKE '%' + @termo + '%'`;
            }

            const resultado = await pool.request()
                .input("termo", termo ?? "")
                .query(query);

            return resultado.recordset as IUsuario[];

        } catch (error) {
            console.error("Erro ao listar usuarios:", error);
            return null;
        }
    }
}