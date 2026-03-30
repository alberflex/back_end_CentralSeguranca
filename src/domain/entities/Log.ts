export interface LogObject {
    id: number;
    tela: string;
    acao: string;
    idUsuario: number;
    nomeUsuario: string;
    dataHora: Date;
    mensagem: string;
}

export class Log {
    id: number;
    dataHora: Date;
    nomeUsuario: string;
    idUsuario: number;
    tela: string;
    acao: string;
    mensagem: string;

    constructor(properties: LogObject) {
        this.id = properties.id;
        this.dataHora = properties.dataHora;
        this.nomeUsuario = properties.nomeUsuario;
        this.idUsuario = properties.idUsuario;
        this.tela = properties.tela;
        this.acao = properties.acao;
        this.mensagem = properties.mensagem;
    }
}