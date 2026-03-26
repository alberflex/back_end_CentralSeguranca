export interface VeiculoObject {
    id: number;
    placa: string;
    modelo: string;
    caminhoImagem: string;
    km_atual: number;
}

export type VeiculoUpdate = Partial<Omit<Veiculo, 'placa'>>; 

export class Veiculo {
    id?: number;
    placa: string;
    modelo: string;
    caminhoImagem: string;
    km_atual: number;

    constructor(properties: VeiculoObject) {
        this.id = properties.id;
        this.placa = properties.placa;
        this.modelo = properties.modelo;
        this.caminhoImagem = properties.caminhoImagem;
        this.km_atual = properties.km_atual;
    }
}