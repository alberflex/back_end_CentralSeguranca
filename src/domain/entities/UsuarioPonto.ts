export interface UsuarioPontoObject {
    nome: string;
    chapa: string;
    cpf: string;
}

export class UsuarioPonto {
    nome: string;
    chapa: string;
    cpf: string;

    constructor(properties: UsuarioPontoObject) {
        this.nome = properties.nome;
        this.cpf = properties.cpf;
        this.chapa = properties.chapa;
    }

    get Object(): UsuarioPontoObject {
        return {
            nome: this.nome,
            cpf: this.cpf,
            chapa: this.chapa,
        };
    }
}