import { Router } from "express";
import { ControleVeiculoService } from "../../services/ControleVeiculoService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";

const rotasControleVeiculo = Router();
const controleVeiculo = new ControleVeiculoService();

rotasControleVeiculo.post("/cadastroControleVeiculo", autenticarJWT, async (req, res) => {
    try {
        return res.status(201).json(await controleVeiculo.cadastrarControleVeiculo(req.body));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.delete("/deletarControleVeiculo/:id", async (req, res) => {
    try {
        return res.status(200).json(await controleVeiculo.deletarControleVeiculo(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.get("/listarTodosVeiculos", async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        return res.status(200).json(await controleVeiculo.listarTodosControlesVeiculos(dataInicio as string, dataFim as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.get("/listarVeiculoPorId/:id", async (req, res) => {
    try {
        return res.status(200).json(await controleVeiculo.listarControlesVeiculosPorID(parseInt(req.params.id, 10)))
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasControleVeiculo.put("/editarSolicitacao/:id", async (req, res) => {
    try {
        const registroEditado = await controleVeiculo.editarSolicitacao(parseInt(req.params.id, 10), req.body);
        if (registroEditado) return res.status(201).json(registroEditado)

    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        return res.status(500).json('Erro interno no servidor.');
    }
});

rotasControleVeiculo.get("/contarSolicitacoesVeiculosEmAberto", async (req, res) => {
    try {
        const solicitacoesAberto = await controleVeiculo.contarSolicitacaoAberto();
        return res.status(200).json({ total: solicitacoesAberto ?? 0 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao contar solicitações em aberto" });
    }
});

rotasControleVeiculo.get("/listarPessoal", autenticarJWT, async (req, res) => {
    try {
        const { termo } = req.query;

        const pessoal = await controleVeiculo.listarPessoal(termo as string);

        return res.status(200).json(pessoal);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao listar pessoal" });
    }
});


export default rotasControleVeiculo;