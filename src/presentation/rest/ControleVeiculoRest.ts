import { Router } from "express";
import { ControleVeiculoService } from "../../services/ControleVeiculoService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasControleVeiculo = Router();
const controleVeiculo = new ControleVeiculoService();

rotasControleVeiculo.post("/cadastroControleVeiculo", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(201).json(await controleVeiculo.cadastrarControleVeiculo(req.body));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.delete("/deletarControleVeiculo/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controleVeiculo.deletarControleVeiculo(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.get("/listarTodosVeiculos", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        return res.status(200).json(await controleVeiculo.listarTodosControlesVeiculos(dataInicio as string, dataFim as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.get("/listarVeiculoPorId/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await controleVeiculo.listarControlesVeiculosPorID(parseInt(req.params.id, 10)))
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.put("/editarSolicitacao/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(201).json( await controleVeiculo.editarSolicitacao(parseInt(req.params.id, 10), req.body))
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.get("/contarSolicitacoesVeiculosEmAberto", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json({ total: await controleVeiculo.contarSolicitacaoAberto() ?? 0 });
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.get("/listarPessoal", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { termo } = req.query;

        return res.status(200).json(await controleVeiculo.listarPessoal(termo as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});


export default rotasControleVeiculo;