import { Router } from "express";
import { ControleAcessoService } from "../../services/ControleAcessoService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasControleAcesso = Router();
const controleAcesso = new ControleAcessoService();

rotasControleAcesso.post("/cadastrarControleAcesso", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(201).json(await controleAcesso.cadastroAcesso(req.body));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleAcesso.delete("/deletarControleAcesso/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controleAcesso.deletarControleAcesso(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleAcesso.get("/listarControleAcesso", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        return res.status(200).json(await controleAcesso.listarTodosControlesAcessos(dataInicio as string, dataFim as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleAcesso.get("/listarControleAcessoPorId/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controleAcesso.listarControleAcessoPorID(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleAcesso.get("/descobreVisitanteID/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json({ idVisitante: await controleAcesso.descobreVisitanteID(Number(req.params.id)) });
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleAcesso.put("/editarControleAcesso/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controleAcesso.editarControleAcesso(req.body, parseInt(req.params.id)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleAcesso.get("/contarSolicitacoesAcessoEmAberto", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json({ total: await controleAcesso.contarAcessosEmAberto() ?? 0 });
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

export default rotasControleAcesso;