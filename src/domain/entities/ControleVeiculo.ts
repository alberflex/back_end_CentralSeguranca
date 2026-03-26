export interface ControleVeiculoObject {
    id: number;
    idVeiculo: number;
    estado: string;
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
    estado: string;

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
        this.estado = properties.estado;
    }
}
