import { Usuario } from "../domain/entities/Usuario";
import { UsuarioResource } from "../resources/UsuarioResource";

export class UsuarioService {
    private usuario: UsuarioResource;

    constructor() { this.usuario = new UsuarioResource() }

    public listarTodosUsuarios(): Promise<Usuario[]> {
        return this.usuario.listarTodosUsuarios();
    }
}