import { Pessoal } from "../../domain/entities/Pessoal";

export interface IPessoalRepository {
    listarPessoal(nome?: string): Promise<Pessoal[]>;    
}