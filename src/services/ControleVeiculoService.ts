import { ControleVeiculo } from "../domain";
import { EAcao } from "../enums/EAcao";
import { ETelas } from "../enums/ETelas";
import { BaseService } from "../helpers/BaseService";
import { IControleVeiculo } from "../interface/IControleVeiculo";
import { IUsuario } from "../interface/IUsuario";
import { ILocalizacoesMaisCadastradasDashboard } from "../interface/IVeiculo";
import { ControleVeiculoResource } from "../resources/ControleVeiculoResource";
import { VeiculoResource } from "../resources/VeiculoResource";
import { EmailService } from "../utils/Email";
import { ErroAplicacao } from "../utils/Erros";
import { LogService } from "./LogService";

export class ControleVeiculoService extends BaseService {
    private controleVeiculo: ControleVeiculoResource;
    private veiculoResource: VeiculoResource;
    private logService: LogService;

    constructor() {
        super();

        this.controleVeiculo = new ControleVeiculoResource();
        this.veiculoResource = new VeiculoResource();
        this.logService = new LogService();
    }

    public async cadastrarControleVeiculo(cadastro: IControleVeiculo): Promise<ControleVeiculo> {
        try {
            const veiculo = await this.veiculoResource.listarVeiculoPorId(cadastro.idVeiculo);
            if (!veiculo) throw new ErroAplicacao("Veículo não encontrado", 404);

            const verificaRegistroAberto = await this.controleVeiculo.verificaSolicitacaoParaVeiculoAberto(veiculo.id!);
            if (verificaRegistroAberto) throw new ErroAplicacao("O veículo tem registro em aberto", 400);

            if (cadastro.km_inicial_veiculo < veiculo.km_atual) { cadastro.km_inicial_veiculo = veiculo.km_atual }

            const controleCadastrado = await this.controleVeiculo.cadastrarControleVeiculo(cadastro);
            if (!controleCadastrado) throw new ErroAplicacao("Falha ao cadastrar controle do veículo", 500);

            this.logService.cadastrarLog({
                tela: ETelas.CONTROLE_VEICULO,
                acao: EAcao.CADASTRO,
                idUsuario: this.user.id,
                nomeUsuario: this.user.nome,
                dadosDepois: controleCadastrado
            });

            const listarControleCadastrado = await this.controleVeiculo.listarControlesVeiculosPorID(controleCadastrado.id);
            if (!listarControleCadastrado) throw new ErroAplicacao("Falha ao obter controle cadastrado", 500);

            const nomesResponsaveis = await this.controleVeiculo.listarNomesResponsaveis(listarControleCadastrado.id);
            if (!nomesResponsaveis) throw new ErroAplicacao("Falha ao listar responsáveis", 500);

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
                        <p><strong>Autorização:</strong> ${nomesResponsaveis.nome_responsavel_autorizacao}</p>
                        <p><strong>Motorista:</strong> ${nomesResponsaveis.nome_responsavel}</p>
                        <p><strong>Portaria:</strong> ${nomesResponsaveis.nome_porteiro_saida}</p>
                        <p><strong>Placa:</strong> ${veiculo.placa}</p>
                        <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                        <p><strong>Condição do veículo na saída:</strong> ${cadastro.condicao_saida}</p>
                        <p><strong>Destino:</strong> ${cadastro.localizacao} - ${cadastro.destino}</p>
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
            const emails = [
                'marcos.souza@alberflex.ind.br',
                'almox.geral@alberflex.ind.br',
                'marcio.vieira@alberflex.ind.br',
                'ivan.junior@alberflex.ind.br',
                'informatica@alberflex.com.br',
                'portaria@alberflex.ind.br'
            ];

            for (const email of emails) await objEmail.enviarEmail(email, 'Rastreio veículo', mensagemEmail);

            return controleCadastrado;
        } catch (erro) {
            if (erro instanceof ErroAplicacao) throw erro;
            throw new ErroAplicacao("Erro interno ao cadastrar controle de veículo", 500);
        }
    }

    public async editarSolicitacao(id: number, dados: IControleVeiculo): Promise<ControleVeiculo | null> {
        try {
            const verificaSolicitacaoAberta = await this.controleVeiculo.verificaSolicitacaoAberta(id);
            if (!verificaSolicitacaoAberta) throw new Error("Solicitação já finalizada ou não encontrada.");

            const veiculo = await this.veiculoResource.listarVeiculoPorId(verificaSolicitacaoAberta.idVeiculo);
            if (!veiculo) throw new Error("Veículo não encontrado");

            if (dados.km_final_veiculo < veiculo.km_atual) {
                throw new Error("Kilometragem inválida. A Kilometragem atual é maior que a final");
            }

            const controleEditado = await this.controleVeiculo.editarSolicitacao(id, dados, veiculo.id!);
            if (!controleEditado) {
                throw new Error("Erro ao processar a edição");
            }

            this.logService.cadastrarLog({
                tela: ETelas.CONTROLE_VEICULO,
                acao: EAcao.EDICAO,
                idUsuario: this.user.id,
                nomeUsuario: this.user.nome,
                dadosAntes: await this.controleVeiculo.listarControlesVeiculosPorID(id),
                dadosDepois: controleEditado,
            });

            const listarControle = await this.controleVeiculo.listarControlesVeiculosPorID(controleEditado.id);
            if (!listarControle) {
                throw new Error("Erro ao processar a listagem de controle por veiculo");
            }

            const nomesResponsaveis = await this.controleVeiculo.listarNomesResponsaveis(listarControle.id);
            if (!nomesResponsaveis) return controleEditado;

            function formatarDataHora(data: string, hora: string | Date): string {
                const [year, month, day] = data.split('T')[0].split('-');

                let h = 0, m = 0;

                if (typeof hora === 'string') {
                    const dateHora = new Date(hora);
                    h = dateHora.getUTCHours();
                    m = dateHora.getUTCMinutes();
                } else if (hora instanceof Date) {
                    h = hora.getUTCHours();
                    m = hora.getUTCMinutes();
                }

                return `${day}/${month}/${year} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            }

            const mensagemEmail = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
            <meta charset="UTF-8">
            <title>Rastreio Veículo</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f2f4f6; margin: 0; padding: 0; color: #333; }
                .wrapper { width: 100%; padding: 20px 0; }
                .container { max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background-color: #007bff; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; }
                .content { padding: 20px; }
                .content p { margin: 10px 0; font-size: 16px; }
                .content p.text-center { text-align: center; font-weight: bold; font-size: 18px; }
                .btn-container { text-align: center; margin-top: 30px; }
                .btn { display: inline-block; padding: 12px 25px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 8px; transition: background-color 0.3s; }
                .footer { text-align: center; font-size: 12px; color: #888; padding: 15px 0; background-color: #f2f4f6; }
            </style>
            </head>
            <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">Veículo retornado</div>
                    <div class="content">
                        <p class="text-center">Registro de entrada de frota de veículos.</p>
                        <p><strong>Autorização:</strong> ${nomesResponsaveis.nome_responsavel_autorizacao}</p>
                        <p><strong>Motorista:</strong> ${nomesResponsaveis.nome_responsavel}</p>
                        <p><strong>Porteiro saída:</strong> ${nomesResponsaveis.nome_porteiro_saida}</p>
                        <p><strong>Porteiro entrada:</strong> ${nomesResponsaveis.nome_porteiro_entrada}</p>
                        <p><strong>Placa:</strong> ${veiculo.placa}</p>
                        <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                        <p><strong>Condição do veículo na saída:</strong> ${dados.condicao_saida}</p>
                        <p><strong>Condição do veículo na entrada:</strong> ${dados.condicao_entrada}</p>
                        <p><strong>Destino:</strong>${dados.localizacao} - ${dados.destino}</p>
                        <p><strong>Km Inicial:</strong> ${veiculo.km_atual}</p>
                        <p><strong>Km Final:</strong> ${dados.km_final_veiculo}</p>
                        <p><strong>Data saída:</strong> ${formatarDataHora(controleEditado.dataSolicitacao.toISOString(), controleEditado.horarioSaida)}</p>
                        <p><strong>Data retorno:</strong> ${formatarDataHora(controleEditado.dataChegada.toISOString(), controleEditado.horarioChegada)}</p>
                        <div class="btn-container">
                            <a href="http://centralseg.alberflex.com.br:3000/" class="btn">Acessar Sistema</a>
                        </div>
                    </div>
                </div>
                <div class="footer">© 2026 Alberflex. Todos os direitos reservados.</div>
            </div>
            </body>
            </html>
        `;

            const objEmail = new EmailService();

            const destinatarios = [
                'marcos.souza@alberflex.ind.br',
                'almox.geral@alberflex.ind.br',
                'marcio.vieira@alberflex.ind.br',
                'ivan.junior@alberflex.ind.br',
                'informatica@alberflex.com.br',
                'portaria@alberflex.ind.br'
            ];

            for (const email of destinatarios) {
                await objEmail.enviarEmail(email, 'Rastreio veículo', mensagemEmail);
            }

            return controleEditado;
        } catch (erro) {
            console.error("Erro ao editar controle de veículo:", erro);
            return null;
        }
    }

    public async deletarControleVeiculo(id: number): Promise<ControleVeiculo> {
        const buscarControleVeiculo = await this.controleVeiculo.listarControlesVeiculosPorID(id);
        if (!buscarControleVeiculo) throw new ErroAplicacao("Controle veículo não encontrado", 404);

        this.logService.cadastrarLog({
            tela: ETelas.CONTROLE_VEICULO,
            acao: EAcao.EXCLUSAO,
            idUsuario: this.user.id,
            nomeUsuario: this.user.nome,
            dadosAntes: buscarControleVeiculo
        });

        return this.controleVeiculo.deletarControleVeiculo(buscarControleVeiculo.id);
    }

    public listarTodosControlesVeiculos(dataInicio?: string, dataFim?: string): Promise<ControleVeiculo[]> {
        if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
            throw new ErroAplicacao("É necessário informar dataInicio e dataFim juntos.", 400);
        }

        return this.controleVeiculo.listarTodosControlesVeiculos(dataInicio, dataFim);
    }

    public async listarControlesVeiculosPorID(id: number): Promise<ControleVeiculo> {
        const buscarControleVeiculoPorID = await this.controleVeiculo.listarControlesVeiculosPorID(id)
        if (!buscarControleVeiculoPorID) throw new ErroAplicacao(`Controle veículo por ID ${id} não encontrado`, 404);

        return buscarControleVeiculoPorID;
    }

    public contarSolicitacaoAberto(): Promise<number> {
        return this.controleVeiculo.contarSolicitacoesVeiculosEmAberto();
    }

    public async localizacoesMaisCadastradas(): Promise<ILocalizacoesMaisCadastradasDashboard[]> {
        const localizacoesMaisAcessadas = await this.veiculoResource.localizacoesMaisCadastradas();
        if (!localizacoesMaisAcessadas || localizacoesMaisAcessadas.length === 0) {
            throw new ErroAplicacao("Informações dashboard nao encontradas", 404);
        }

        const agrupado = localizacoesMaisAcessadas.reduce((acc, item) => {
            const chave = `${item.ano}-${item.mes}`;

            if (!acc[chave]) {
                acc[chave] = {
                    ano: item.ano,
                    mes: item.mes,
                    trajetos: []
                };
            }

            acc[chave].trajetos.push({
                localizacao: item.localizacao,
                rotas: item.rotas
            });

            return acc;
        }, {} as Record<string, any>);

        return Object.values(agrupado);
    }

    public async listarPessoal(termo?: string): Promise<IUsuario[] | null> {
        return this.controleVeiculo.listarPessoal(termo);
    }
}