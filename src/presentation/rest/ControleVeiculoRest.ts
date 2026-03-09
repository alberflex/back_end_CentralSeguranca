import { Router } from "express";
import { ControleVeiculoService } from "../../services/ControleVeiculoService";
import { autenticarJWT } from "../../middleware/JWT";

const rotasControleVeiculo = Router();
const controleVeiculo = new ControleVeiculoService();

rotasControleVeiculo.post("/cadastroControleVeiculo", autenticarJWT, async (req, res) => {
    try {
        const cadastrado = await controleVeiculo.cadastrarControleVeiculo(req.body);
        if (cadastrado) return res.status(201).json(cadastrado);
        return res.status(400).json('Erro ao cadastrar o ponto');
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ erro: "Erro ao cadastrar ponto" });
    }
});

rotasControleVeiculo.delete("/deletarControleVeiculo/:id", async (req, res) => {
    try {
        const deletado = await controleVeiculo.deletarControleVeiculo(parseInt(req.params.id, 10));
        if (!deletado) { return res.status(404).json({ erro: "Registro não encontrado ou já deletado" }); }
        return res.status(200).json(deletado);
    } catch (err: any) {
        console.error("Erro ao deletar:", err);
        return res.status(500).json({ erro: err.message || "Erro ao deletar ponto" });
    }
});

rotasControleVeiculo.get("/listarTodosVeiculos", async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        const veiculos = await controleVeiculo.listarTodosControlesVeiculos(dataInicio as string, dataFim as string);
        if (veiculos) {
            res.status(200).json(veiculos);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error("Erro ao obter todas solicitacoes veiculos:", err);
        res.status(500).json({ erro: "Erro ao obter todas solicitacoes veiculos" });
    }
});

rotasControleVeiculo.get("/listarVeiculoPorId/:id", async (req, res) => {
    try {
        const ponto = await controleVeiculo.listarControlesVeiculosPorID(parseInt(req.params.id, 10));
        if (ponto) {
            res.status(200).json(ponto);
        } else {
            res.status(404).json([]);
        }
    } catch (err) {
        console.error("Erro ao obter controle de veiculo:", err);
        res.status(500).json({ erro: "Erro ao obter controle de veiculo" });
    }
});

rotasControleVeiculo.put("/editarSolicitacao/:id", async (req, res) => {
    try {
        const registroEditado = await controleVeiculo.editarSolicitacao(parseInt(req.params.id, 10), req.body);
        if (registroEditado) return res.status(201).json(registroEditado)
        return res.status(400).json('Registro fechado. Não é possível edita-lo');
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