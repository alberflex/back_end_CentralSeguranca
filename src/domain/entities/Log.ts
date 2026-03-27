export interface LogObject {
    id: number;
    tela: string;
    acao: string;
    idUsuario: number;
    nomeUsuario: string;
    dataHora: Date;
}

export class Log {
    id: number;
    dataHora: Date;
    nomeUsuario: string;
    idUsuario: number;
    tela: string;
    acao: string;

    constructor(properties: LogObject) {
        this.id = properties.id;
        this.dataHora = properties.dataHora;
        this.nomeUsuario = properties.nomeUsuario;
        this.idUsuario = properties.idUsuario;
        this.tela = properties.tela;
        this.acao = properties.acao;
    }
}