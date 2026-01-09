import { IVisitanteRepository } from "../data/repositories/VisitanteRepository";
import { conexaoMSSQL } from "../db";
import { Visitante } from "../domain";
import { IVisitante } from "../interface/IVisitante";
import sql from 'mssql';

export class VisitanteResource implements IVisitanteRepository {

    public async editarVisitante(visitante: IVisitante, id: number): Promise<Visitante | null> {
        try {
            const pool = await conexaoMSSQL();

            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .input("cpf", sql.VarChar, visitante.cpf)
                .input("nome", sql.VarChar, visitante.nome)
                .input("empresa", sql.VarChar, visitante.empresa)
                .input("caminho_foto_visitante", sql.VarChar, visitante.caminho_foto_visitante ?? null)
                .input("caminho_imagem_assinatura", sql.VarChar, visitante.caminho_imagem_assinatura ?? null)
                .query(`
                UPDATE cs_visitante
                SET
                    cpf = @cpf,
                    nome = @nome,
                    empresa = @empresa,
                    caminho_foto_visitante = COALESCE(@caminho_foto_visitante, caminho_foto_visitante),
                    caminho_imagem_assinatura = COALESCE(@caminho_imagem_assinatura, caminho_imagem_assinatura)
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

            return resultado.recordset[0] || null;
        } catch (error) {
            console.error("Erro ao editar visitante:", error);
            return null;
        }
    }


    public async cadastrarVisitante(visitante: IVisitante): Promise<Visitante | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("cpf", sql.VarChar, visitante.cpf)
                .input("nome", sql.VarChar, visitante.nome)
                .input("empresa", sql.VarChar, visitante.empresa)
                .input("caminho_foto_visitante", sql.VarChar, visitante.caminho_foto_visitante)
                .input("caminho_imagem_assinatura", sql.VarChar, visitante.caminho_imagem_assinatura)
                .query(`
                INSERT INTO cs_visitante (cpf, nome, empresa, caminho_foto_visitante, caminho_imagem_assinatura)
                OUTPUT INSERTED.*
                VALUES (@cpf, @nome, @empresa, @caminho_foto_visitante, @caminho_imagem_assinatura)
            `);

            return resultado.recordset[0] || null;
        } catch (error) {
            console.error('Erro ao cadastrar visitante:', error);
            return null;
        }
    }

    public async deletarVisitante(id: number): Promise<Visitante | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`
                    DELETE FROM cs_visitante
                    OUTPUT DELETED.*
                    WHERE id = @id
                `);

            return resultado.recordset[0] as Visitante || null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async listarTodosVisitantes(): Promise<Visitante[]> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(
                `SELECT * FROM cs_visitante;`
            )
            return resultado.recordset as Visitante[];
        } catch (error) {
            console.error("Erro ao listar visitante: ", error)
            return []
        }
    }

    public async listarVisitantePorId(id: number): Promise<Visitante | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`SELECT * FROM cs_visitante where id = @id`);

            if (resultado.recordset.length > 0) return resultado.recordset[0] as Visitante;

            return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async selecionaPorCPF(CPF: string): Promise<Visitante | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().input("CPF", sql.VarChar, CPF).query(`SELECT * FROM cs_visitante WHERE cpf = @CPF`);

            if (resultado.recordset.length > 0) return resultado.recordset[0] as Visitante;
            return null;
        } catch (error) {
            console.error("Erro ao selecionar visitante por CPF", error);
            return null;
        }
    }
}