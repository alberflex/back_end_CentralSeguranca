export interface UsuarioObject {
    id: number;
    nome: string;
    chapa: string;
    cpf: string;
    senha: string;
    papel: string;
}

export class Usuario {
    id: number;
    nome: string;
    chapa: string;
    cpf: string;
    senha: string;
    papel: string;

    constructor(properties: UsuarioObject) {
        this.id = properties.id;
        this.nome = properties.nome;
        this.chapa = properties.chapa;
        this.cpf = properties.cpf;
        this.senha = properties.senha;
        this.papel = properties.papel;
    }
}
