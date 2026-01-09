export interface PorteiroObject {
    id: number;
    nome: string;
    chapa: string;
    cpf: string;
    senha: string;
    papel: string;
}

export class Porteiro {
    id: number;
    nome: string;
    chapa: string;
    cpf: string;
    senha: string;
    papel: string;

    constructor(properties: PorteiroObject) {
        this.id = properties.id;
        this.nome = properties.nome;
        this.chapa = properties.chapa;
        this.cpf = properties.cpf;
        this.senha = properties.senha;
        this.papel = properties.papel;
    }

    get Object(): PorteiroObject {
        return {
            id: this.id,
            nome: this.nome,
            chapa: this.chapa,
            cpf: this.cpf,
            senha: this.senha,
            papel: this.papel
        };
    }
}
