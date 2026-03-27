import { IVeiculoRepository } from "../data/repositories/VeiculoRepository";
import { Veiculo, VeiculoUpdate } from "../domain";
import { conexaoMSSQL } from "../db";
import { IVeiculoDashboard } from "../interface/IVeiculo";
import sql from 'mssql';

export class VeiculoResource implements IVeiculoRepository {

    public async veiculosMaisUtilizados(): Promise<IVeiculoDashboard[]> {
        const pool = await conexaoMSSQL();
        await pool.request().query(`SET LANGUAGE Portuguese;`);

        const resultado = await pool.request().query(`
            SELECT 
                ve.placa,
                YEAR(cv.data_solicitacao) AS ano,
                CASE MONTH(cv.data_solicitacao)
                    WHEN 1 THEN 'Janeiro'
                    WHEN 2 THEN 'Fevereiro'
                    WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril'
                    WHEN 5 THEN 'Maio'
                    WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho'
                    WHEN 8 THEN 'Agosto'
                    WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro'
                    WHEN 11 THEN 'Novembro'
                    WHEN 12 THEN 'Dezembro'
                END AS mes,
                COUNT(*) AS total_utilizacoes
            FROM cs_controleVeiculo cv
            INNER JOIN cs_veiculo ve 
                ON cv.idVeiculo = ve.id
            GROUP BY 
                ve.placa,
                YEAR(cv.data_solicitacao),
                MONTH(cv.data_solicitacao)
            ORDER BY 
                ano DESC,
                MONTH(cv.data_solicitacao);   
            `)

        return resultado.recordset as IVeiculoDashboard[];
    }

    public async cadastrarVeiculo(veiculo: Veiculo): Promise<Veiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("placa", sql.VarChar(10), veiculo.placa)
            .input("caminho_imagem_veiculo", sql.VarChar(500), veiculo.caminhoImagem)
            .input("km_atual", sql.Float, veiculo.km_atual)
            .input("modelo", sql.VarChar(100), veiculo.modelo).query(`
                    INSERT INTO cs_veiculo (placa, caminho_imagem_veiculo, km_atual, modelo)
                    OUTPUT INSERTED.*
                    VALUES (@placa, @caminho_imagem_veiculo, @km_atual, @modelo)
                `);
        return resultado.recordset?.[0];
    }

    public async editarVeiculo(veiculo: VeiculoUpdate, id: number): Promise<VeiculoUpdate> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .input("caminho_imagem_veiculo", sql.VarChar, veiculo.caminhoImagem)
            .input("km_atual", sql.Int, veiculo.km_atual)
            .input("modelo", sql.VarChar, veiculo.modelo)
            .query(`
                UPDATE cs_veiculo 
                SET 
                    caminho_imagem_veiculo = @caminho_imagem_veiculo,
                    km_atual = @km_atual,
                    modelo = @modelo
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
            .query(`SELECT * FROM cs_veiculo where id = @id`);

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