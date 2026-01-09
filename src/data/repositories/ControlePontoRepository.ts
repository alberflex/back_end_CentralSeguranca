import { ControlePonto } from "../../domain";

export interface IControlePontoRepository {
    listarTodosPontos(): Promise<ControlePonto[]>;
    listarPontosPorID(id: number): Promise<ControlePonto | null>
    deletarControlePonto(id: number): Promise<ControlePonto | null>;
    cadastrarControlePonto(idPorteiro: number, chapa: string): Promise<ControlePonto | null>
    fecharPonto(id: number): Promise<ControlePonto | null>
}