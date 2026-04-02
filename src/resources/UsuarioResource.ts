import { IUsuarioRepository } from "../data/repositories/UsuarioRepository";
import { Usuario } from "../domain/entities/Usuario";
import { conexaoMSSQL } from "../db";

export class UsuarioResource implements IUsuarioRepository {

    public async listarTodosUsuarios(): Promise<Usuario[]> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().query(`SELECT * FROM cs_porteiro ORDER BY nome ASC`)

        return resultado.recordset as Usuario[];
    }
}