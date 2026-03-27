export interface IVisitante {
    id: number;
    nome: string;
    cpf: string;
    empresa: string;
    caminho_foto_visitante: string;
}

export interface IVisitanteDashboard {
    ano: string;
    mes: string;
    nome: string;
    total_visitas: number;
}