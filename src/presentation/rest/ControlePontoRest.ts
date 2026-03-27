import { Router } from "express";
import { ControlePontoService } from "../../services/ControlePontoService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasControlePonto = Router();
const controlePonto = new ControlePontoService();

rotasControlePonto.post("/cadastroPonto", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { chapa } = req.body;
        return res.status(201).json(await controlePonto.cadastrarControlePonto(req.user!.id, chapa));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasControlePonto.delete("/deletarPonto/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controlePonto.deletarControlePonto(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasControlePonto.get("/listarTodosPontos", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        return res.status(200).json(await controlePonto.listarTodosPontos(dataInicio as string, dataFim as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasControlePonto.get("/listarPontoPorID/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controlePonto.listarPontosPorID(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControlePonto.put("/fecharPonto/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controlePonto.fecharPonto(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
})

rotasControlePonto.get("/contarPontosEmAberto", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json({ total: await controlePonto.contarSolicitacoesEmAberto() ?? 0 });
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});


export default rotasControlePonto;