export interface IControleVeiculo {
    idVeiculo: number;
    destino: string;
    km_inicial_veiculo: number;
    km_final_veiculo: number;
    idPorteiroSaida: number;
    idResponsavel: string;
    localizacao: string;
    idPorteiroEntrada: number;
    idResponsavelAutorizacao: string;
    condicaoEntrada: string;
    condicaoSaida: string;
}

export interface IFechamentoControleVeiculo {
    data_chega: Date;
    horario_chegada: string;
    km_final_veiculo: number;
    idPorteiroEntrada: number;
}

export interface IEditacaoSolicitacao {
    idPorteiroSaida: number;
    destino: string;
    idResponsavel: string;
    localizacao: string;
    idResponsavelAutorizacao: string;
}