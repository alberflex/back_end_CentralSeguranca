import { Usuario } from "../../domain/entities/Usuario";

export interface IUsuarioRepository {
    listarTodosUsuarios(): Promise<Usuario[]>;  
}