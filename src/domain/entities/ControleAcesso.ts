export interface ControleAcessoObject {
    id: number;
    idVisitante: number;
    idPorteiroEntrada: number;
    idPorteiroSaida: number;
    dataEntrada: Date;
    horaEntrada: string;
    dataSaida: Date;
    horaSaida: string;
    objetivo: string;
    placaVeiculo: string;
    numeroCartao: string;
}

export class ControleAcesso {
    id: number;
    idVisitante: number;
    idPorteiroEntrada: number;
    idPorteiroSaida: number;
    dataEntrada: Date;
    horaEntrada: string;
    dataSaida: Date;
    horaSaida: string;
    objetivo: string;
    placaVeiculo: string;
    numeroCartao: string;

    constructor(properties: ControleAcessoObject) {
        this.id = properties.id;
        this.idVisitante = properties.idVisitante;
        this.idPorteiroEntrada = properties.idPorteiroEntrada;
        this.idPorteiroSaida = properties.idPorteiroSaida;
        this.dataEntrada = properties.dataEntrada;
        this.horaEntrada = properties.horaEntrada;
        this.dataSaida = properties.dataSaida;
        this.horaSaida = properties.horaSaida;
        this.objetivo = properties.objetivo;
        this.placaVeiculo = properties.placaVeiculo;
        this.numeroCartao = properties.numeroCartao;
    }
}