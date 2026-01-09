export interface ControleVeiculoObject {
    id: number;
    idVeiculo: number;
    dataSolicitacao: Date;
    horarioSaida: string;
    kmInicialVeiculo: number;
    dataChegada: Date;
    horarioChegada: string;
    kmFinalVeiculo: number;
    idPorteiroSaida: number;
    chapaResponsavel: string;
    localizacao: string;
    idPorteiroEntrada: number;
    chapaResponsavelAutorizacao: string;
}

export class ControleVeiculo {
    id: number;
    idVeiculo: number;
    dataSolicitacao: Date;
    horarioSaida: string;
    kmInicialVeiculo: number;
    dataChegada: Date;
    horarioChegada: string;
    kmFinalVeiculo: number;
    idPorteiroSaida: number;
    chapaResponsavel: string;
    localizacao: string;
    idPorteiroEntrada: number;
    chapaResponsavelAutorizacao: string;

    constructor(properties: ControleVeiculoObject) {
        this.id = properties.id;
        this.idVeiculo = properties.idVeiculo;
        this.dataSolicitacao = properties.dataSolicitacao;
        this.horarioSaida = properties.horarioSaida;
        this.kmInicialVeiculo = properties.kmInicialVeiculo;
        this.dataChegada = properties.dataChegada;
        this.horarioChegada = properties.horarioChegada;
        this.kmFinalVeiculo = properties.kmFinalVeiculo;
        this.idPorteiroSaida = properties.idPorteiroSaida;
        this.chapaResponsavel = properties.chapaResponsavel;
        this.localizacao = properties.localizacao;
        this.idPorteiroEntrada = properties.idPorteiroEntrada;
        this.chapaResponsavelAutorizacao = properties.chapaResponsavelAutorizacao;
    }

    get Object(): ControleVeiculoObject {
        return {
            id: this.id,
            idVeiculo: this.idVeiculo,
            dataSolicitacao: this.dataSolicitacao,
            horarioSaida: this.horarioSaida,
            kmInicialVeiculo: this.kmInicialVeiculo,
            dataChegada: this.dataChegada,
            horarioChegada: this.horarioChegada,
            kmFinalVeiculo: this.kmFinalVeiculo,
            idPorteiroSaida: this.idPorteiroSaida,
            chapaResponsavel: this.chapaResponsavel,
            localizacao: this.localizacao,
            idPorteiroEntrada: this.idPorteiroEntrada,
            chapaResponsavelAutorizacao: this.chapaResponsavelAutorizacao,
        };
    }
}
