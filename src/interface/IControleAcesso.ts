export interface ControleAcesso {
    id: number;
    nomeVisitante: string;
    nomePorteiroEntrada: string;
    nomePorteiroSaida: string;
    responsavel: string;
    dataEntrada: Date;
    horaEntrada: string;
    dataSaida: Date;
    horaSaida: string;
    objetivo: string;
    placaVeiculo: string;
    numeroCartao: string;
}

export interface ICadastroControleAcesso {
    idVisitante: number;
    idPorteiroEntrada: number;
    objetivo: string;
    placaVeiculo: string;
    numeroCartao: string
    responsavel: string;
}

export interface IEdicaoControleAcesso {
    id: number;
    idPorteiroEntrada: string;
    idPorteiroSaida: string;
    responsavel: string;
    objetivo: string;
    placaVeiculo: string;
    numeroCartao: string;
    data_saida: Date;
    hora_saida: string;
}