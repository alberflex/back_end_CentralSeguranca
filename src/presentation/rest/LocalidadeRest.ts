import { Router } from "express";
import { autenticarJWT } from "../../middleware/JWT";

// Repassa as consultas de estados e cidades ao IBGE. O navegador da portaria nao consegue
// acessar o IBGE direto (o proxy da rede remove o cabecalho CORS), entao o backend busca por ele.
const rotasLocalidade = Router();
const URL_IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades";

// Estados e cidades quase nunca mudam; guarda em memoria por 24 horas
const TEMPO_CACHE_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { dados: unknown; expiraEm: number }>();

const buscarNoIBGE = async (caminho: string) => {
    const emCache = cache.get(caminho);
    if (emCache && emCache.expiraEm > Date.now()) return emCache.dados;

    const resposta = await fetch(`${URL_IBGE}/${caminho}`);
    if (!resposta.ok) throw new Error(`IBGE respondeu ${resposta.status}`);

    const dados = await resposta.json();
    cache.set(caminho, { dados, expiraEm: Date.now() + TEMPO_CACHE_MS });
    return dados;
};

rotasLocalidade.get("/estados", autenticarJWT, async (req, res) => {
    try {
        return res.status(200).json(await buscarNoIBGE("estados"));
    } catch (err) {
        console.log(err);
        return res.status(502).json({ erro: "Não foi possível consultar os estados no IBGE." });
    }
});

rotasLocalidade.get("/estados/:sigla/municipios", autenticarJWT, async (req, res) => {
    const sigla = String(req.params.sigla).toUpperCase();
    if (!/^[A-Z]{2}$/.test(sigla)) return res.status(400).json({ erro: "Sigla de estado inválida." });

    try {
        return res.status(200).json(await buscarNoIBGE(`estados/${sigla}/municipios`));
    } catch (err) {
        console.log(err);
        return res.status(502).json({ erro: "Não foi possível consultar as cidades no IBGE." });
    }
});

export default rotasLocalidade;
