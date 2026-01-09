import { Visitante } from "../domain";
import { IVisitante } from "../interface/IVisitante";
import { VisitanteResource } from "../resources/VisitanteResource";
import { removeArquivoRede } from "../utils/ArmazenamentoRede";

export class VisitanteService {
    private visitanteResource: VisitanteResource;

    constructor() { this.visitanteResource = new VisitanteResource() }

    public async cadastrarVisitanteComTermo(visitante: IVisitante, assinatura: string): Promise<Visitante | null> {
        const visitanteCadastrado = await this.visitanteResource.cadastrarVisitante(visitante);
        if (!visitanteCadastrado) return null;

        const htmlTermo = this.gerarHtmlTermoAceite(
            visitante.nome,
            visitante.cpf,
            assinatura
        );

        

        return visitanteCadastrado;
    }

    private gerarHtmlTermoAceite(nome: string, cpf: string, assinaturaBase64: string): string {
        return `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 30px; }
                        .assinatura { margin-top: 40px; text-align: center; }
                        img { max-width: 300px; }
                    </style>
                </head>
                <body>
                    <h2>TERMO DE ACEITE E AUTORIZAÇÃO</h2>
                    <p>
                        Eu, <strong>${nome}</strong>, inscrito no CPF <strong>${cpf}</strong>,
                        declaro que autorizo o tratamento e compartilhamento dos meus dados
                        para fins de controle de acesso à empresa, conforme as normas internas.
                    </p>
                    <p>
                        Estou ciente das normas de segurança da empresa e comprometo-me a respeitá-las.
                    </p>
                    <p>Data do aceite: ${new Date().toLocaleDateString("pt-BR")}</p>
                    <div class="assinatura">
                        <p>Assinatura do visitante:</p>
                        <img src="${assinaturaBase64}" />
                    </div>
                </body>
            </html>
        `;
    }

    

    public async editarVisitante(visitante: IVisitante, id: number): Promise<Visitante | null> {
        const visitanteAtual = await this.visitanteResource.listarVisitantePorId(id);
        if (!visitanteAtual) throw new Error("Visitante não encontrado");

        const visitanteEditado = await this.visitanteResource.editarVisitante(visitante, id);
        if (!visitanteEditado) return null;

        if (visitante.caminho_foto_visitante && visitanteAtual.caminho_foto_visitante && visitante.caminho_foto_visitante !== visitanteAtual.caminho_foto_visitante) { removeArquivoRede(visitanteAtual.caminho_foto_visitante); }
        if (visitante.caminho_imagem_assinatura && visitanteAtual.caminho_imagem_assinatura && visitante.caminho_imagem_assinatura !== visitanteAtual.caminho_imagem_assinatura) { removeArquivoRede(visitanteAtual.caminho_imagem_assinatura); }

        return visitanteEditado;
    }

    public deletarVisitante(id: number): Promise<Visitante | null> {
        return this.visitanteResource.deletarVisitante(id);
    }

    public listarTodosVisitantes(): Promise<Visitante[]> {
        return this.visitanteResource.listarTodosVisitantes();
    }

    public listarVisitantePorId(id: number): Promise<Visitante | null> {
        return this.visitanteResource.listarVisitantePorId(id);
    }

    public async selecionaPorCPF(CPF: string): Promise<Visitante | null> {
        return await this.visitanteResource.selecionaPorCPF(CPF);
    }
}