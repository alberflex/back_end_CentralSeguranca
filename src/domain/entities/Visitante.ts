export interface VisitanteObject {
    id: number;
    nome: string;
    cpf: string;
    empresa: string;
    caminho_foto_visitante: string | null;
}

export class Visitante {
    id: number;
    nome: string;
    cpf: string;
    empresa: string;
    caminho_foto_visitante: string | null;

    constructor(properties: VisitanteObject) {
        this.id = properties.id;
        this.nome = properties.nome;
        this.cpf = properties.cpf;
        this.empresa = properties.empresa;
        this.caminho_foto_visitante = properties.caminho_foto_visitante;
    }

    get Object(): VisitanteObject {
        return {
            id: this.id,
            nome: this.nome,
            cpf: this.cpf,
            empresa: this.empresa,
            caminho_foto_visitante: this.caminho_foto_visitante
        };
    }
}