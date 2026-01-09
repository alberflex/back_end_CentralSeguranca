import { IPessoalRepository } from "../data/repositories/PessoalRepository";
import { conexaoMSSQL } from "../db";
import { Pessoal } from "../domain/entities/Pessoal";

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
}