import { IControleVeiculoRepository } from "../data/repositories/ControleVeiculoRepository";
import { conexaoMSSQL } from "../db";
import { ControleVeiculo, Veiculo } from "../domain";
import { IControleVeiculo } from "../interface/IControleVeiculo";
import { INomeControleVeiculo } from "../interface/INomeControleVeiculo";
import { IUsuario } from "../interface/IUsuario";
import sql from 'mssql';
import { VeiculoResource } from "./VeiculoResource";

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

    public async listarNomesResponsaveis(id: number): Promise<INomeControleVeiculo | null> {
        try {
            const pool = await conexaoMSSQL();

            const resultado = await pool.request()
                .input("id", sql.Int, Number(id))
                .query(`
                    SELECT 
                        pe.nome AS nome_responsavel,
                        pe2.nome AS nome_responsavel_autorizacao,
                        poSaida.nome AS nome_porteiro_saida,
                        poEntrada.nome AS nome_porteiro_entrada
                    FROM cs_controleVeiculo cv
                    LEFT JOIN alb_pessoal pe 
                        ON pe.chapa = cv.idResponsavel
                    LEFT JOIN alb_pessoal pe2 
                        ON pe2.chapa = cv.idResponsavelAutorizacao
                    LEFT JOIN cs_porteiro poSaida 
                        ON poSaida.id = cv.idPorteiroSaida
                    LEFT JOIN cs_porteiro poEntrada 
                        ON poEntrada.id = cv.idPorteiroEntrada
                    WHERE cv.id =  @id
            `);

            if (resultado.recordset.length === 0) {
                return null;
            }
            console.log(resultado.recordset[0])
            return resultado.recordset[0] as INomeControleVeiculo;
        } catch (error: any) {
            console.error("Erro ao listar nomes do controle de veículo:", error);
            return null;
        }
    }

    public async listarTodosControlesVeiculos(dataInicio?: string, dataFim?: string): Promise<ControleVeiculo[]> {
        try {
            const pool = await conexaoMSSQL();
            const request = pool.request();

            let filtroData = "";

            if (!dataInicio && !dataFim) {
                filtroData = "WHERE CAST(cv.data_solicitacao AS DATE) = CAST(GETDATE() AS DATE)";
            } else if (dataInicio && dataFim) {
                filtroData = "WHERE CAST(cv.data_solicitacao AS DATE) BETWEEN @dataInicio AND @dataFim";
                request.input("dataInicio", dataInicio);
                request.input("dataFim", dataFim);
            }
            else {
                throw new Error("É necessário informar dataInicio e dataFim juntos.");
            }

            const resultado = await request.query(
                `SELECT 
                cv.id,
                ve.placa,
                cv.destino,
                cv.data_solicitacao,
                cv.horario_saida,
                cv.km_inicial_veiculo as km_inicial_veiculo,
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
            ${filtroData}
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

    public async editarSolicitacao(id: number, dados: IControleVeiculo, idVeiculo: number): Promise<ControleVeiculo | null> {
        const veiculo = new VeiculoResource();

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

                .query(`
                        UPDATE cs_controleVeiculo 
                        SET 
                            destino = @destino, 
                            idPorteiroSaida = @idPorteiroSaida,
                            idResponsavel = @idResponsavel, 
                            localizacao = @localizacao,
                            idResponsavelAutorizacao = @idResponsavelAutorizacao,
                            data_chegada = @data_chegada,
                            horario_chegada = @horario_chegada,
                            km_final_veiculo = @km_final_veiculo,
                            idPorteiroEntrada = @idPorteiroEntrada
                        OUTPUT 
                            INSERTED.id AS id,
                            INSERTED.idVeiculo AS idVeiculo,
                            INSERTED.destino AS destino,
                            INSERTED.data_solicitacao AS dataSolicitacao,
                            INSERTED.horario_saida AS horarioSaida,
                            INSERTED.km_inicial_veiculo AS kmInicialVeiculo,
                            INSERTED.data_chegada AS dataChegada,
                            INSERTED.horario_chegada AS horarioChegada,
                            INSERTED.km_final_veiculo AS kmFinalVeiculo,
                            INSERTED.idPorteiroSaida AS idPorteiroSaida,
                            INSERTED.idResponsavel AS idResponsavel,
                            INSERTED.localizacao AS localizacao,
                            INSERTED.idPorteiroEntrada AS idPorteiroEntrada,
                            INSERTED.idResponsavelAutorizacao AS idResponsavelAutorizacao
                        WHERE id = @id`);

            if (!await veiculo.alteraKilometragem(idVeiculo, dados.km_final_veiculo)) return null;
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
                .query(`SELECT id, data_chegada, horario_chegada, idVeiculo FROM cs_controleVeiculo WHERE id = @id`);

            if (resultado.recordset.length === 0) {
                console.log("Solicitação não encontrada para o ID:", id);
                return null;
            }

            const registro = resultado.recordset[0];

            const dataChegadaVazia =
                registro.data_chegada === null ||
                registro.data_chegada === undefined ||
                registro.data_chegada === '';

            const horarioChegadaVazio =
                registro.horario_chegada === null ||
                registro.horario_chegada === undefined ||
                registro.horario_chegada === '';

            const solicitacaoAberta = dataChegadaVazia && horarioChegadaVazio;

            if (solicitacaoAberta) {
                return registro as ControleVeiculo;
            }

            return null;
        } catch (error) {
            console.log("Erro ao verificar solicitação aberta:", error);
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