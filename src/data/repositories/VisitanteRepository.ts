import { Visitante } from "../../domain/entities/Visitante";
import { IVisitante } from "../../interface/IVisitante";

export interface IVisitanteRepository {
    listarTodosVisitantes(): Promise<Visitante[]>;
    listarVisitantePorId(id: number): Promise<Visitante | null>;
    deletarVisitante(id: number): Promise<Visitante | null>;
    cadastrarVisitante(porteiro: IVisitante): Promise<IVisitante | null>;
}