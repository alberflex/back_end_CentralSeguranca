import { UsuarioPonto } from "../domain/entities/UsuarioPonto";
import { UsuarioPontoResource } from "../resources/UsuarioPonto";

export class UsuarioPontoService {
    private usuarioPonto: UsuarioPontoResource;

    constructor() { this.usuarioPonto = new UsuarioPontoResource() }

    public listarTodosUsuariosPonto(): Promise<UsuarioPonto[]> {
        return this.usuarioPonto.listarTodosUsuariosControlePonto();
    }
}