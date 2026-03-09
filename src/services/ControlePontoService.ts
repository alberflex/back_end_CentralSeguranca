import { ControlePonto } from "../domain";
import { ControlePontoResource } from "../resources/ControlePontoResource";

export class ControlePontoService {
    private controlePontoResource: ControlePontoResource;

    constructor() { this.controlePontoResource = new ControlePontoResource() }

    public cadastrarControlePonto(idPorteiro: number, chapa: string): Promise<ControlePonto | null> {
        return this.controlePontoResource.cadastrarControlePonto(idPorteiro, chapa);
    }

    public deletarControlePonto(id: number): Promise<ControlePonto | null> {
        return this.controlePontoResource.deletarControlePonto(id);
    }

    public listarTodosPontos(dataInicio?: string, dataFim?: string): Promise<ControlePonto[]> {
        return this.controlePontoResource.listarTodosPontos(dataInicio, dataFim);
    }

    public listarPontosPorID(id: number): Promise<ControlePonto | null> {
        return this.controlePontoResource.listarPontosPorID(id);
    }

    public fecharPonto(id: number): Promise<ControlePonto | null> {
        return this.controlePontoResource.fecharPonto(id);
    }

    public contarSolicitacoesEmAberto(): Promise<number | null> {
        return this.controlePontoResource.contarPontosAberto();
    }
}