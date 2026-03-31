import { IPessoalRepository } from "../data/repositories/PessoalRepository";
import { conexaoMSSQL } from "../db";
import { Pessoal } from "../domain/entities/Pessoal";
import sql from 'mssql';

export class PessoalResource implements IPessoalRepository {
    public async listarPessoal(nome?: string): Promise<Pessoal[]> {
        try {
            const pool = await conexaoMSSQL();
            const request = pool.request();

            let query = `SELECT chapa, nome FROM alb_pessoal`;

            if (nome && nome.trim() !== "") {
                query += ` 
                WHERE nome COLLATE Latin1_General_CI_AI LIKE @nome COLLATE Latin1_General_CI_AI`;
                request.input("nome", `%${nome}%`);
            }

            query += ` ORDER BY nome DESC`;

            const result = await request.query(query);
            return result.recordset as Pessoal[];
        } catch (err) {
            console.error("Erro ao listar usuário:", err);
            return [];
        }
    }

    public async listarPorChapa(chapa: string): Promise<Pessoal> {
        const pool = await conexaoMSSQL();

        const resultado = await pool
            .request()
            .input("chapa", sql.VarChar, chapa)
            .query(`
            SELECT chapa, nome 
            FROM alb_pessoal 
            WHERE chapa = @chapa
        `);

        return resultado.recordset?.[0] as Pessoal;
    }

    public async listarUsuariosAprovadores(nome?: string): Promise<Pessoal[]> {
        const pool = await conexaoMSSQL();
        const request = pool.request();

        let query = `SELECT chapa, nome FROM CS_usuariosAprovadoresVeiculo `;

        if (nome && nome.trim() !== "") {
            query += ` 
                WHERE nome COLLATE Latin1_General_CI_AI LIKE @nome COLLATE Latin1_General_CI_AI`;
            request.input("nome", `%${nome}%`);
        }

        query += ` ORDER BY nome DESC`;
        const result = await request.query(query);

        return result.recordset as Pessoal[];
    }
}