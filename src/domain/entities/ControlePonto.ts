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

    get Object(): ControlePontoObject {
        return {
            id: this.id,
            data: this.data,
            horaEntrada: this.horaEntrada,
            horaSaida: this.horaSaida,
            idPorteiro: this.idPorteiro,
            chapa: this.chapa,
        };
    }
}