export interface VeiculoObject {
    id: number;
    placa: string;
    modelo: string;
    caminho_imagem_veiculo: string;
    km_atual: number;
}

export type VeiculoUpdate = Partial<Omit<Veiculo, 'placa'>>; 

export class Veiculo {
    id?: number;
    placa: string;
    modelo: string;
    caminho_imagem_veiculo: string;
    km_atual: number;

    constructor(properties: VeiculoObject) {
        this.id = properties.id;
        this.placa = properties.placa;
        this.modelo = properties.modelo;
        this.caminho_imagem_veiculo = properties.caminho_imagem_veiculo;
        this.km_atual = properties.km_atual;
    }
}