import { ControleVeiculo } from "../domain";
import { IControleVeiculo, IEditacaoSolicitacao } from "../interface/IControleVeiculo";
import { IUsuario } from "../interface/IUsuario";
import { ControleVeiculoResource } from "../resources/ControleVeiculoResource";
import { VeiculoResource } from "../resources/VeiculoResource";
import { EmailService } from "../utils/Email";

export class ControleVeiculoService {
    private controleVeiculo: ControleVeiculoResource;
    private veiculoResource: VeiculoResource;

    constructor() {
        this.controleVeiculo = new ControleVeiculoResource();
        this.veiculoResource = new VeiculoResource();
    }

    public async cadastrarControleVeiculo(cadastro: IControleVeiculo): Promise<ControleVeiculo | null> {
        try {
            const veiculo = await this.veiculoResource.listarVeiculoPorId(cadastro.idVeiculo);
            if (!veiculo) return null;

            if (cadastro.km_inicial_veiculo < veiculo.km_atual) {
                cadastro.km_inicial_veiculo = veiculo.km_atual;
            }

            const dataAtual = new Date().toLocaleString("pt-BR");
            const mensagemEmail = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                <meta charset="UTF-8">
                <title>Rastreio Veículo</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f2f4f6;
                        margin: 0;
                        padding: 0;
                        color: #333;
                    }

                    .wrapper {
                        width: 100%;
                        padding: 20px 0;
                    }

                    .container {
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }

                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                    }

                    .content {
                        padding: 20px;
                    }

                    .content p {
                        margin: 10px 0;
                        font-size: 16px;
                    }

                    .content p.text-center {
                        text-align: center;
                        font-weight: bold;
                        font-size: 18px;
                    }

                    .btn-container {
                        text-align: center;
                        margin-top: 30px;
                    }

                    .btn {
                        display: inline-block;
                        padding: 12px 25px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #ffffff;
                        background-color: #007bff;
                        text-decoration: none;
                        border-radius: 8px;
                        transition: background-color 0.3s;
                    }

                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #888;
                        padding: 15px 0;
                        background-color: #f2f4f6;
                    }
                </style>
                </head>
                <body>
                <div class="wrapper">
                    <div class="container">
                    <div class="header">Veículo Liberado</div>
                    <div class="content">
                        <p class="text-center">Registro de liberação de frota de veículos.</p>
                         <p><strong>Placa:</strong> ${cadastro.idResponsavelAutorizacao}</p>
                        <p><strong>Placa:</strong> ${veiculo.placa}</p>
                        <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                        <p><strong>Destino:</strong> ${cadastro.destino}</p>
                        <p><strong>Km Inicial:</strong> ${veiculo.km_atual}</p>
                        <p><strong>Data:</strong> ${dataAtual}</p>
                        <div class="btn-container">
                            <a href="http://centralseg.alberflex.com.br:3000/" class="btn" style="color: #ffffff; text-decoration: none;">Acessar Sistema</a>
                        </div>
                    </div>
                    </div>
                    <div class="footer">
                    © 2026 Alberflex. Todos os direitos reservados.
                    </div>
                </div>
                </body>
                </html>
                `;

            const objEmail = new EmailService();

            await objEmail.enviarEmail('marcos.souza@alberflex.ind.br', 'Rastreio veículo', mensagemEmail);
            await objEmail.enviarEmail('almox.geral@alberflex.ind.br', 'Rastreio veículo', mensagemEmail);
            await objEmail.enviarEmail('marcio.vieira@alberflex.ind.br', 'Rastreio veículo', mensagemEmail);
            await objEmail.enviarEmail('ivan.junior@alberflex.ind.br', 'Rastreio veículo', mensagemEmail);
            await objEmail.enviarEmail('informatica@alberflex.com.br', 'Rastreio veículo', mensagemEmail);
            const controleCadastrado = await this.controleVeiculo.cadastrarControleVeiculo(cadastro);
            return controleCadastrado;
        } catch (erro) {
            console.error("Erro ao cadastrar controle de veículo:", erro);
            return null;
        }
    }

    public async editarSolicitacao(id: number, dados: IControleVeiculo): Promise<ControleVeiculo | null> {
        const verificaSolicitacaoAberta = await this.controleVeiculo.verificaSolicitacaoAberta(id);
        if (verificaSolicitacaoAberta) {
            return this.controleVeiculo.editarSolicitacao(id, dados);
        }
        return null;
    }

    public deletarControleVeiculo(id: number): Promise<ControleVeiculo | null> {
        return this.controleVeiculo.deletarControleVeiculo(id);
    }

    public listarTodosControlesVeiculos(dataInicio?: string, dataFim?: string): Promise<ControleVeiculo[]> {
        return this.controleVeiculo.listarTodosControlesVeiculos(dataInicio, dataFim);
    }

    public listarControlesVeiculosPorID(id: number): Promise<ControleVeiculo | null> {
        return this.controleVeiculo.listarControlesVeiculosPorID(id);
    }

    public contarSolicitacaoAberto(): Promise<number | null> {
        return this.controleVeiculo.contarSolicitacoesVeiculosEmAberto();
    }

    public async listarPessoal(termo?: string): Promise<IUsuario[] | null> {
        return this.controleVeiculo.listarPessoal(termo);
    }
}