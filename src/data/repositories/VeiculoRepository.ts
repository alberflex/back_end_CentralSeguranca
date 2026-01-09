import { Veiculo } from "../../domain/entities/Veiculo";

export interface IVeiculoRepository {
    listarTodosVeiculos(): Promise<Veiculo[]>;
    listarVeiculoPorId(id: number):Promise< Veiculo | null>;
    cadastrarVeiculo(porteiro: Veiculo): Promise<Veiculo | null>;
    deletarVeiculo(id: number): Promise<Veiculo | null>;
    alteraKilometragem(id: number, novaKilomentragem: number): Promise<Veiculo | null>;
}