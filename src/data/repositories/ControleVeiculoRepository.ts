import { ControleVeiculo } from "../../domain";
import { IControleVeiculo, IEditacaoSolicitacao } from "../../interface/IControleVeiculo";

export interface IControleVeiculoRepository {
    cadastrarControleVeiculo(dados: IControleVeiculo): Promise<ControleVeiculo | null>
    listarTodosControlesVeiculos(): Promise<ControleVeiculo[]>;
    listarControlesVeiculosPorID(id: number): Promise<ControleVeiculo | null>
    fecharSolicitacao(id: number, idPorteiroEntrada: number, kmFinal: number): Promise<ControleVeiculo | null>
    editarSolicitacao(id: number, dados: IEditacaoSolicitacao, idVeiculo: number): Promise<ControleVeiculo | null>
    deletarControleVeiculo(id: number): Promise<ControleVeiculo | null>;
    verificaSolicitacaoAberta(id: number): Promise<ControleVeiculo | null>
    contarSolicitacoesVeiculosEmAberto(): Promise<number | null>
}