import { ControleAcesso, ICadastroControleAcesso } from "../interface/IControleAcesso";
import { ControleAcessoResource } from "../resources/ControleAcessoResource";

export class ControleAcessoService {
    private controleAcessoResource: ControleAcessoResource;

    constructor() { this.controleAcessoResource = new ControleAcessoResource() }

    public cadastroAcesso(dados: ICadastroControleAcesso): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.cadastrarControlePonto(dados);
    }

    public deletarControleAcesso(id: number): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.deletarControleAcesso(id);
    }

    public listarTodosControlesAcessos(): Promise<ControleAcesso[]> {
        return this.controleAcessoResource.listarTodosControleAcessos();
    }

    public listarControleAcessoPorID(id: number): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.listarControleAcessoPorId(id);
    }

    public fecharControleAcesso(id: number, idPorteiro: number): Promise<ControleAcesso | null> {
        return this.controleAcessoResource.fecharControleAcesso(id, idPorteiro);
    }

    public contarAcessosEmAberto(): Promise<number | null> {
        return this.controleAcessoResource.contarAcessoEmAberto();
    }

    public async descobreVisitanteID(id: number): Promise<number | null>{
        return await this.controleAcessoResource.descobreVisitanteID(id);
    }
}