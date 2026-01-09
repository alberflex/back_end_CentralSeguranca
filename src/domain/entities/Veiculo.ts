export interface VeiculoObject {
    id: number;
    placa: string;
    modelo: string;
    caminhoImagem: string;
    km_atual: number;
}

export class Veiculo {
    id: number;
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

    get Object(): VeiculoObject {
        return {
            id: this.id,
            placa: this.placa,
            modelo: this.modelo,
            caminhoImagem: this.caminhoImagem,
            km_atual: this.km_atual,
        };
    }
}