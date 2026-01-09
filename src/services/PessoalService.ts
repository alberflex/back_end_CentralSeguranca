import { Pessoal } from "../domain/entities/Pessoal";
import { PessoalResource } from "../resources/PessoalResource";
import dotenv from 'dotenv';

dotenv.config();

export class PessoalService {
    private pessoalResource: PessoalResource;

    constructor() { this.pessoalResource = new PessoalResource() }

    public listarPessoal(nome?: string): Promise<Pessoal[]> {
        return this.pessoalResource.listarPessoal(nome);
    }
}