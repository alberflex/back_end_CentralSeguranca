import { IControleVeiculoRepository } from "../data/repositories/ControleVeiculoRepository";
import { conexaoMSSQL } from "../db";
import { ControleVeiculo } from "../domain";
import { IControleVeiculo } from "../interface/IControleVeiculo";
import { INomeControleVeiculo } from "../interface/INomeControleVeiculo";
import { IUsuario } from "../interface/IUsuario";
import { dataAtualString } from "../utils/Data";
import { horaAtualBrasiliaString } from "../utils/Horario";
import { VeiculoResource } from "./VeiculoResource";
import sql from 'mssql';

export class ControleVeiculoResource implements IControleVeiculoRepository {
    public async cadastrarControleVeiculo(cadastro: IControleVeiculo): Promise<ControleVeiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("idVeiculo", sql.Numeric, cadastro.idVeiculo)
            .input("destino", sql.VarChar, cadastro.destino)
            .input("data_solicitacao", sql.Date, dataAtualString())
            .input("horario_saida", sql.VarChar, horaAtualBrasiliaString())
            .input("km_inicial_veiculo", sql.Numeric, cadastro.km_inicial_veiculo)
            .input("idPorteiroSaida", sql.Int, cadastro.idPorteiroSaida)
            .input("idResponsavel", sql.VarChar, cadastro.idResponsavel)
            .input("localizacao", sql.VarChar, cadastro.localizacao)
            .input("idResponsavelAutorizacao", sql.VarChar, cadastro.idResponsavelAutorizacao)
            .input("condicao_saida", sql.VarChar, cadastro.condicao_saida)
            .query(`INSERT INTO cs_controleVeiculo 
                        (   idVeiculo,
                            destino,
                            data_solicitacao,
                            horario_saida,
                            km_inicial_veiculo,
                            idPorteiroSaida,
                            idResponsavel,
                            localizacao,
                            idResponsavelAutorizacao,
                            condicao_saida
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
                            @idResponsavelAutorizacao,
                            @condicao_saida
                        )
                    `);

        return resultado.recordset[0] as ControleVeiculo;
    }

    public async deletarControleVeiculo(id: number): Promise<ControleVeiculo> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request().input("id", sql.Int, id)
            .query(`DELETE FROM cs_controleVeiculo OUTPUT DELETED.* WHERE id = @id`);

        return resultado.recordset?.[0];
    }

    public async listarNomesResponsaveis(id: number): Promise<INomeControleVeiculo> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request()
            .input("id", sql.Int, Number(id))
            .query(`
                    SELECT 
                        pe.nome AS nome_responsavel,
                        pe3.nome AS nome_responsavel_entrada,
                        pe2.nome AS nome_responsavel_autorizacao,
                        poSaida.nome AS nome_porteiro_saida,
                        poEntrada.nome AS nome_porteiro_entrada
                    FROM cs_controleVeiculo cv
                    LEFT JOIN alb_pessoal pe 
                        ON pe.chapa = cv.idResponsavel
                    LEFT JOIN alb_pessoal pe3 
                        ON pe3.chapa = cv.idResponsavelEntrada
                    LEFT JOIN alb_pessoal pe2 
                        ON pe2.chapa = cv.idResponsavelAutorizacao
                    LEFT JOIN cs_porteiro poSaida 
                        ON poSaida.id = cv.idPorteiroSaida
                    LEFT JOIN cs_porteiro poEntrada 
                        ON poEntrada.id = cv.idPorteiroEntrada
                    WHERE cv.id = @id;
            `);
        return resultado.recordset?.[0] as INomeControleVeiculo;
    }

    public async listarTodosControlesVeiculos(dataInicio?: string, dataFim?: string): Promise<ControleVeiculo[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();

        let filtroData = "";

        if (!dataInicio && !dataFim) {
            filtroData = `
            WHERE 
            (
                CAST(cv.data_solicitacao AS DATE) = CAST(GETDATE() AS DATE)
                OR cv.data_chegada IS NULL
            )
        `;
        }

        else if (dataInicio && dataFim) {
            filtroData = `
            WHERE 
            (
                CAST(cv.data_solicitacao AS DATE) BETWEEN @dataInicio AND @dataFim
                OR cv.data_chegada IS NULL
            )
        `;
            request.input("dataInicio", dataInicio);
            request.input("dataFim", dataFim);
        }

        const resultado = await request.query(`
                    SELECT 
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
                        pr_saida.nome AS nome_responsavel,
                        pr_entrada.nome AS nome_responsavel_entrada,
                        pa.nome AS nome_responsavel_autorizacao,
                        cv.localizacao,
                        cv.condicao_saida,
                        cv.condicao_entrada
                    FROM cs_controleVeiculo cv
                    INNER JOIN cs_veiculo ve 
                        ON cv.idVeiculo = ve.id
                    INNER JOIN cs_porteiro po 
                        ON cv.idPorteiroSaida = po.id
                    INNER JOIN alb_pessoal pr_saida 
                        ON cv.idResponsavel = pr_saida.chapa
                    LEFT JOIN alb_pessoal pr_entrada 
                        ON cv.idResponsavelEntrada = pr_entrada.chapa
                    LEFT JOIN alb_pessoal pa 
                        ON cv.idResponsavelAutorizacao = pa.chapa
                    ${filtroData}
                    ORDER BY
                        CASE 
                            WHEN cv.data_chegada IS NULL 
                            AND cv.horario_chegada IS NULL THEN 0
                            ELSE 1
                        END,
                        cv.data_solicitacao DESC,
                        cv.horario_saida DESC;
                `);
        return resultado.recordset as ControleVeiculo[];
    }

    public async listarControlesVeiculosPorID(id: number): Promise<ControleVeiculo> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request().input("id", sql.Int, id)
            .query(`SELECT * FROM cs_controleVeiculo where id = @id`);

        return resultado.recordset[0];
    }

    public async editarSolicitacao(id: number, dados: IControleVeiculo, idVeiculo: number): Promise<ControleVeiculo | null> {
        const veiculo = new VeiculoResource();

        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .input("destino", sql.VarChar, dados.destino)
            .input("idPorteiroSaida", sql.Int, dados.idPorteiroSaida)
            .input("idResponsavel", sql.VarChar, dados.idResponsavel)
            .input("idResponsavelEntrada", sql.VarChar, dados.idResponsavelEntrada)
            .input("localizacao", sql.VarChar, dados.localizacao)
            .input("idResponsavelAutorizacao", sql.VarChar, dados.idResponsavelAutorizacao)
            .input("data_chegada", sql.Date, dataAtualString())
            .input("horario_chegada", sql.VarChar, horaAtualBrasiliaString())
            .input("km_final_veiculo", sql.Numeric, dados.km_final_veiculo)
            .input("idPorteiroEntrada", sql.Int, dados.idPorteiroEntrada)
            .input("condicao_entrada", sql.VarChar, dados.condicao_entrada)
            .query(`    UPDATE cs_controleVeiculo 
                        SET 
                            destino = @destino, 
                            idPorteiroSaida = @idPorteiroSaida,
                            idResponsavel = @idResponsavel, 
                            localizacao = @localizacao,
                            idResponsavelAutorizacao = @idResponsavelAutorizacao,
                            data_chegada = @data_chegada,
                            horario_chegada = @horario_chegada,
                            km_final_veiculo = @km_final_veiculo,
                            idPorteiroEntrada = @idPorteiroEntrada,
                            condicao_entrada = @condicao_entrada,
                            idResponsavelEntrada = @idResponsavelEntrada
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
                            INSERTED.idResponsavelAutorizacao AS idResponsavelAutorizacao,
                            INSERTED.condicao_entrada AS condicao_entrada,
                            INSERTED.idResponsavelEntrada AS idResponsavelEntrada
                        WHERE id = @id`);

        if (!await veiculo.alteraKilometragem(idVeiculo, dados.km_final_veiculo)) return null;
        if (!resultado.recordset[0]) return null;

        return resultado.recordset[0];
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

    public async fecharSolicitacao(id: number, idPorteiroEntrada: number, kmFinal: number): Promise<ControleVeiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .input("horario_chegada", sql.VarChar, horaAtualBrasiliaString())
            .input("data_chegada", sql.Date, dataAtualString())
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

        return resultado.recordset[0] as ControleVeiculo;
    }

    public async contarSolicitacoesVeiculosEmAberto(): Promise<number> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().query(`SELECT COUNT(*) AS total FROM cs_controleVeiculo WHERE data_chegada IS NULL and horario_chegada IS NULL;`);

        return resultado.recordset[0]?.total ?? 0;
    }

    public async verificaSolicitacaoParaVeiculoAberto(idVeiculo: number): Promise<boolean> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input('IdVeiculo', idVeiculo)
            .query(`
                SELECT COUNT(*) AS aberto
                FROM cs_controleVeiculo
                WHERE idVeiculo = @IdVeiculo
                AND data_chegada IS NULL
                AND horario_chegada IS NULL;
            `);

        return (resultado.recordset[0]?.aberto ?? 0) > 0;
    }

    public async listarPessoal(termo?: string): Promise<IUsuario[]> {
        const pool = await conexaoMSSQL();

        let query = `SELECT * FROM alb_pessoal`;

        if (termo && termo.trim() !== "") {
            query += ` WHERE nome LIKE '%' + @termo + '%'`;
        }

        const resultado = await pool.request()
            .input("termo", termo ?? "")
            .query(query);

        return resultado.recordset as IUsuario[];
    }
}