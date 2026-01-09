import { Porteiro } from "../../domain/entities/Porteiro";

export interface IPorteiroRepository {
    listarTodosPorteiros(): Promise<Porteiro[]>;    
    listarPorteiroPorId(id: number): Promise<Porteiro | null>;
    cadastrarPorteiro(porteiro: Porteiro): Promise<Porteiro | null>;
    deletarPorteiro(id: number): Promise<Porteiro | null>;
    buscarPorChapa(chapa: string): Promise<Porteiro | null>;
}