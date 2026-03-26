import { IVeiculoRepository } from "../data/repositories/VeiculoRepository";
import { Veiculo, VeiculoUpdate } from "../domain";
import { conexaoMSSQL } from "../db";
import sql from 'mssql';

export class VeiculoResource implements IVeiculoRepository {
    
    public async cadastrarVeiculo(veiculo: Veiculo): Promise<Veiculo | null> {
        try {
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
            return resultado.recordset[0] || null;
        } catch (error) {
            console.error("Erro ao cadastrar veiculo: ", error);
            return null;
        }
    }

    public async editarVeiculo(veiculo: VeiculoUpdate, id: number): Promise<VeiculoUpdate | null> {

        try {
            const pool = await conexaoMSSQL();
            await pool.request()
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

            return veiculo;
        } catch (error) {
            console.error("Erro ao editar veiculo", error);
            return null;
        }
    }

    public async deletarVeiculo(id: number): Promise<Veiculo> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().input("id", sql.Int, id).query(`DELETE FROM cs_veiculo OUTPUT DELETED.* WHERE id = @id`);

        return resultado.recordset?.[0] as Veiculo;
    }

    public async listarTodosVeiculos(placa?: string): Promise<Veiculo[]> {
        try {
            const pool = await conexaoMSSQL();
            const request = pool.request();

            let filtro = "";

            if (placa) {
                filtro = "WHERE placa LIKE @placa";
                request.input("placa", `%${placa}%`);
            }

            const resultado = await request.query(`SELECT * FROM cs_veiculo ${filtro}`);

            return resultado.recordset as Veiculo[];
        } catch (error) {
            console.error("Erro ao listar veículos: ", error);
            return [];
        }
    }

    public async listarVeiculoPorId(id: number): Promise<Veiculo | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`SELECT * FROM cs_veiculo where id = @id`);

            if (resultado.recordset.length > 0) return resultado.recordset[0] as Veiculo;

            return null;
        } catch (error) {
            console.error("Error as buscar veiculo por ID");
            return null;
        }
    }

    public async alteraKilometragem(idVeiculo: number, kmFinal: number) {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("idVeiculo", sql.Int, idVeiculo)
            .query("SELECT * FROM cs_veiculo WHERE id = @idVeiculo");

        if (!resultado.recordset || resultado.recordset.length === 0) {
            throw new Error(`Veículo com id ${idVeiculo} não encontrado na alteração de km.`);
        }

        const veiculo = resultado.recordset[0];

        await pool.request()
            .input("kmFinal", sql.Int, kmFinal)
            .input("idVeiculo", sql.Int, idVeiculo)
            .query("UPDATE cs_veiculo SET km_atual = @kmFinal WHERE id = @idVeiculo");

        return veiculo;
    }
}