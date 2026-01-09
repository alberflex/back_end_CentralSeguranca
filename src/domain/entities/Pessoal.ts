export interface PessoalObject {
    id: number;
    nome: string;
    chapa: string;
}

export class Pessoal {
    id: number;
    nome: string;
    chapa: string;

    constructor(properties: PessoalObject) {
        this.id = properties.id;
        this.nome = properties.nome;
        this.chapa = properties.chapa;
    }
}
