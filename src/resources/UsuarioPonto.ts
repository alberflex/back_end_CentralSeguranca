import { conexaoMSSQL } from "../db";
import { UsuarioPonto } from "../domain/entities/UsuarioPonto";

export class UsuarioPontoResource {
    public async listarTodosUsuariosControlePonto(): Promise<UsuarioPonto[]> {
        const pool = await conexaoMSSQL();
        const resultado = await pool.request().query(
            `SELECT * FROM cs_usuarioControlePonto;`
        )
        return resultado.recordset?.[0] as UsuarioPonto[];
    }
}