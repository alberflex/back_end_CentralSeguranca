import { IPorteiroRepository } from "../data/repositories/PorteiroRepository";
import { conexaoMSSQL } from "../db";
import { Porteiro } from "../domain";
import sql from 'mssql';

export class PorteiroResource implements IPorteiroRepository {
    public async cadastrarPorteiro(porteiro: Porteiro): Promise<Porteiro | null> {
        try {
            const pool = await conexaoMSSQL();
            const cadastraPorteiro = await pool.request()
                .input("cpf", sql.VarChar, porteiro.cpf)
                .input("chapa", sql.VarChar, porteiro.chapa)
                .input("nome", sql.VarChar, porteiro.nome)
                .input("senha", sql.VarChar, porteiro.senha)
                .input("papel", sql.VarChar, porteiro.papel)
                .query(` INSERT INTO cs_porteiro 
                        (
                            cpf,
                            chapa,
                            nome,
                            senha,
                            papel
                        )
                        OUTPUT INSERTED.*
                        VALUES 
                        (
                            @cpf,
                            @chapa,
                            @nome,
                            @senha,
                            @papel
                        )
            `)
            return cadastraPorteiro.recordset[0] as Porteiro || null;
        } catch (error) {
            console.error("Erro ao cadastrar porteiro");
            return null;
        }
    }

    public async alterarSenha(chapa: string, senha: string): Promise<Porteiro | null> {
        try {
            const pool = await conexaoMSSQL();
            const cadastraPorteiro = await pool.request()
                .input("senha", sql.VarChar, senha)
                .input("chapa", sql.VarChar, chapa)
                .query(`
                UPDATE cs_porteiro
                SET senha = @senha
                OUTPUT INSERTED.*
                WHERE chapa = @chapa;
            `);

            if (cadastraPorteiro.recordset && cadastraPorteiro.recordset.length > 0) {
                const porteiro = await this.buscarPorChapa(chapa);
                return porteiro as Porteiro;
            }
            return null;
        } catch (error) {
            console.error("Erro ao cadastrar porteiro");
            return null;
        }
    }

    public async deletarPorteiro(id: number): Promise<Porteiro | null> {
        try {
            const pool = await conexaoMSSQL();
            const verificaExistente = await this.listarPorteiroPorId(id);
            if (verificaExistente) {
                const resultado = await pool.request().input("id", sql.Int, id).query(`DELETE FROM cs_porteiro WHERE id = @id`);
                if (resultado.recordset.length > 0) return verificaExistente as Porteiro;
            }
            return null;
        } catch (error) {
            console.error("Erro ao deletar porteiro: " + error);
            return null;
        }
    }

    public async listarTodosPorteiros(): Promise<Porteiro[]> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request().query(
                `SELECT * FROM cs_porteiro WHERE papel = 'PORTEIRO'`
            )
            return resultado.recordset as Porteiro[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public async listarPorteiroPorId(id: number): Promise<Porteiro | null> {
        try {
            const pool = await conexaoMSSQL();
            const resultado = await pool.request()
                .input("id", sql.Int, id)
                .query(`SELECT * FROM cs_porteiro where id = @id`);
            if (resultado.recordset.length > 0) return resultado.recordset[0] as Porteiro;
            return null;
        } catch (error) {
            console.error("Erro ao listar usuário por ID", error);
            return null;
        }
    }

    public async buscarPorChapa(chapa: string): Promise<Porteiro | null> {
        try {
            const pool = await conexaoMSSQL();
            const result = await pool.request()
                .input("chapa", sql.VarChar(150), chapa)
                .query(`SELECT id, cpf, chapa, nome, senha, papel FROM cs_porteiro WHERE chapa = @chapa`);

            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0] as Porteiro;
            }
            return null;
        } catch (err) {
            console.error("Erro ao buscar usuário por e-mail:", err);
            return null;
        }
    }

    public async editarUsuario(id: number, senha: string | null, papel: string): Promise<Porteiro | null> {
        try {
            const pool = await conexaoMSSQL();
            const request = pool.request();

            request.input("papel", sql.VarChar(150), papel);
            request.input("id", sql.Numeric, id);

            let query = "UPDATE cs_porteiro SET papel = @papel";

            if (senha && senha.trim() !== "") {
                query += ", senha = @senha";
                request.input("senha", sql.VarChar(150), senha);
            }

            query += " WHERE id = @id";
            await request.query(query);

            const resultado = await pool.request().input("id", sql.Numeric, id).query("SELECT * FROM cs_porteiro WHERE id = @id");
            return resultado.recordset[0] ?? null;
        } catch (error) {
            console.error("Erro ao editar usuário:", error);
            return null;
        }
    }
}