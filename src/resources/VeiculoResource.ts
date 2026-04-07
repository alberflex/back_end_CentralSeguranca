import { IVeiculoRepository } from "../data/repositories/VeiculoRepository";
import { Veiculo, VeiculoUpdate } from "../domain";
import { conexaoMSSQL } from "../db";
import { ILocalizacoesMaisCadastradasDashboard, IVeiculoDashboard } from "../interface/IVeiculo";
import sql from 'mssql';

export class VeiculoResource implements IVeiculoRepository {

    public async veiculosMaisUtilizados(): Promise<IVeiculoDashboard[]> {
        const pool = await conexaoMSSQL();
        await pool.request().query(`SET LANGUAGE Portuguese;`);

        const resultado = await pool.request().query(`
           SELECT
                ve.placa,
                YEAR(GETDATE()) AS ano,
                DATENAME(MONTH, GETDATE()) AS mes,
                COUNT(cv.id) AS total_utilizacoes
            FROM cs_veiculo ve
            LEFT JOIN cs_controleVeiculo cv 
                ON cv.idVeiculo = ve.id
                AND MONTH(cv.data_solicitacao) = MONTH(GETDATE())
                AND YEAR(cv.data_solicitacao) = YEAR(GETDATE())
            GROUP BY 
                ve.placa
            ORDER BY 
                total_utilizacoes DESC; 
            `)

        return resultado.recordset as IVeiculoDashboard[];
    }

    public async localizacoesMaisCadastradas(): Promise<ILocalizacoesMaisCadastradasDashboard[]> {
        const pool = await conexaoMSSQL();
        await pool.request().query(`SET LANGUAGE Portuguese;`);

        const resultado = await pool.request().query(`
                SELECT 
                    YEAR(GETDATE()) AS ano,
                    DATENAME(MONTH, GETDATE()) AS mes,
                    UPPER(localizacao) COLLATE Latin1_General_CI_AI AS localizacao,
                    COUNT(cv.id) AS rotas
                FROM cs_controleVeiculo cv
                WHERE 
                    cv.data_solicitacao >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                    AND cv.data_solicitacao < DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
                GROUP BY 
                    UPPER(localizacao) COLLATE Latin1_General_CI_AI
                ORDER BY 
                    rotas DESC;`)

        return resultado.recordset as ILocalizacoesMaisCadastradasDashboard[];
    }

    public async cadastrarVeiculo(veiculo: Veiculo): Promise<Veiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("placa", sql.VarChar(10), veiculo.placa)
            .input("caminho_imagem_veiculo", sql.VarChar(500), veiculo.caminho_imagem_veiculo)
            .input("km_atual", sql.Float, veiculo.km_atual)
            .input("modelo", sql.VarChar(100), veiculo.modelo).query(`
                    INSERT INTO cs_veiculo (placa, caminho_imagem_veiculo, km_atual, modelo)
                    OUTPUT INSERTED.*
                    VALUES (@placa, @caminho_imagem_veiculo, @km_atual, @modelo)
                `);

                console.log()
        return resultado.recordset?.[0];
    }

    public async editarVeiculo(veiculo: VeiculoUpdate, id: number): Promise<VeiculoUpdate> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .input("caminho_imagem_veiculo", sql.VarChar, veiculo.caminho_imagem_veiculo)
            .input("km_atual", sql.Int, veiculo.km_atual)
            .input("modelo", sql.VarChar, veiculo.modelo)
            .query(`
                UPDATE cs_veiculo 
                SET 
                    caminho_imagem_veiculo = @caminho_imagem_veiculo,
                    km_atual = @km_atual,
                    modelo = @modelo
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        return resultado.recordset?.[0] as VeiculoUpdate;
    }

    public async deletarVeiculo(id: number): Promise<Veiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().input("id", sql.Int, id).query(`DELETE FROM cs_veiculo OUTPUT DELETED.* WHERE id = @id`);

        return resultado.recordset?.[0] as Veiculo;
    }

    public async listarTodosVeiculos(placa?: string): Promise<Veiculo[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();

        let filtro = "";

        if (placa) {
            filtro = "WHERE placa LIKE @placa";
            request.input("placa", `%${placa}%`);
        }

        const resultado = await request.query(`SELECT * FROM cs_veiculo ${filtro}`);

        return resultado.recordset as Veiculo[];
    }

    public async listarVeiculoPorId(id: number): Promise<Veiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .query(` SELECT 
                            id,
                            placa,
                            modelo,
                            km_atual,
                            caminho_imagem_veiculo
                        FROM cs_veiculo 
                        WHERE id = @id`);

        return resultado.recordset?.[0] as Veiculo;
    }

    public async alteraKilometragem(idVeiculo: number, kmFinal: number): Promise<Veiculo> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request()
            .input("kmFinal", sql.Int, kmFinal)
            .input("idVeiculo", sql.Int, idVeiculo)
            .query("UPDATE cs_veiculo SET km_atual = @kmFinal OUTPUT DELETED.* WHERE id = @idVeiculo");

        return resultado.recordset?.[0] as Veiculo;
    }
}