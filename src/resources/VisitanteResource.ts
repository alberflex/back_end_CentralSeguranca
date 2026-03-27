import { IVisitanteRepository } from "../data/repositories/VisitanteRepository";
import { conexaoMSSQL } from "../db";
import { Visitante } from "../domain";
import { IVisitante, IVisitanteDashboard } from "../interface/IVisitante";
import sql from 'mssql';

export class VisitanteResource implements IVisitanteRepository {

    public async editarVisitante(visitante: IVisitante, id: number): Promise<Visitante> {
        const pool = await conexaoMSSQL();

        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .input("cpf", sql.VarChar, visitante.cpf)
            .input("nome", sql.VarChar, visitante.nome)
            .input("empresa", sql.VarChar, visitante.empresa)
            .input("caminho_foto_visitante", sql.VarChar, visitante.caminho_foto_visitante ?? null)
            .query(`
                UPDATE cs_visitante
                SET
                    cpf = @cpf,
                    nome = @nome,
                    empresa = @empresa,
                    caminho_foto_visitante = COALESCE(@caminho_foto_visitante, caminho_foto_visitante)
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        return resultado.recordset?.[0] as Visitante;
    }

    public async cadastrarVisitante(visitante: IVisitante): Promise<IVisitante> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("cpf", sql.VarChar, visitante.cpf)
            .input("nome", sql.VarChar, visitante.nome)
            .input("empresa", sql.VarChar, visitante.empresa)
            .input("caminho_foto_visitante", sql.VarChar, visitante.caminho_foto_visitante)
            .query(`INSERT INTO cs_visitante (cpf, nome, empresa, caminho_foto_visitante) OUTPUT INSERTED.* VALUES (@cpf, @nome, @empresa, @caminho_foto_visitante)`);
        return resultado.recordset[0] as IVisitante;
    }

    public async deletarVisitante(id: number): Promise<Visitante> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                    DELETE FROM cs_visitante
                    OUTPUT DELETED.*
                    WHERE id = @id
                `);

        return resultado.recordset[0] as Visitante;
    }

    public async listarTodosVisitantes(): Promise<Visitante[]> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().query(
            `SELECT * FROM cs_visitante;`
        )
        return resultado.recordset as Visitante[];
    }

    public async listarVisitantePorId(id: number): Promise<Visitante> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .input("id", sql.Int, id)
            .query(`SELECT * FROM cs_visitante where id = @id`);

        return resultado.recordset[0] as Visitante;
    }

    public async dashboardVisitante(): Promise<IVisitanteDashboard[]> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request()
            .query(`SELECT TOP 10
                YEAR(ca.data_entrada) AS ano,
                DATENAME(MONTH, ca.data_entrada) AS mes,
                v.nome,
                COUNT(*) AS total_visitas
            FROM cs_controleAcesso ca
            INNER JOIN cs_visitante v ON v.id = ca.idVisitante
            GROUP BY 
                YEAR(ca.data_entrada),
                MONTH(ca.data_entrada),
                DATENAME(MONTH, ca.data_entrada),
                v.nome
            ORDER BY 
                ano DESC,
                total_visitas DESC;`);
        return resultado.recordset as IVisitanteDashboard[];
    }


    public async selecionaPorCPF(CPF: string): Promise<Visitante> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().input("CPF", sql.VarChar, CPF).query(`SELECT * FROM cs_visitante WHERE cpf = @CPF`);
        return resultado.recordset[0] as Visitante;
    }
}