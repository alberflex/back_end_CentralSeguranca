export interface ControlePontoObject {
    id: number;
    data: Date;
    horaEntrada: string;
    horaSaida: string;
    idPorteiro: number;
    chapa: string;
}

export class ControlePonto {
    id: number;
    data: Date;
    horaEntrada: string;
    horaSaida: string;
    idPorteiro: number;
    chapa: string;

    constructor(properties: ControlePontoObject) {
        this.id = properties.id;
        this.data = properties.data;
        this.horaEntrada = properties.horaEntrada;
        this.horaSaida = properties.horaSaida;
        this.idPorteiro = properties.idPorteiro;
        this.chapa = properties.chapa;
    }
}