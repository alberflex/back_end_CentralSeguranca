import { Router } from "express";
import { ControlePontoService } from "../../services/ControlePontoService";
import { autenticarJWT } from "../../middleware/JWT";

const rotasControlePonto = Router();
const controlePonto = new ControlePontoService();

rotasControlePonto.post("/cadastroPonto", autenticarJWT, async (req, res) => {
    try {
        const id = req.user?.id;
        if (!id) return res.status(400).json("Usuário precisa estar cadastrado");

        const { chapa } = req.body;
        const cadastrado = await controlePonto.cadastrarControlePonto(id, chapa);

        if (cadastrado) return res.status(201).json(cadastrado);
        return res.status(400).json("Erro ao cadastrar o ponto");
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ erro: "Erro ao cadastrar ponto" });
    }
});

rotasControlePonto.delete("/deletarPonto/:id", autenticarJWT, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" });

    try {
        const deletado = await controlePonto.deletarControlePonto(id);

        if (!deletado) {
            return res.status(404).json({ erro: "Registro não encontrado ou já deletado" });
        }

        return res.status(200).json(deletado);
    } catch (err: any) {
        console.error("Erro ao deletar:", err);
        return res.status(500).json({ erro: err.message || "Erro ao deletar ponto" });
    }
});

rotasControlePonto.get("/listarTodosPontos", autenticarJWT, async (req, res) => {
    try {
        const pontos = await controlePonto.listarTodosPontos();
        if (pontos) {
            res.status(200).json(pontos);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error("Erro ao obter ponto:", err);
        res.status(500).json({ erro: "Erro ao obter ponto" });
    }
});

rotasControlePonto.get("/listarPontoPorID/:id", autenticarJWT, async (req, res) => {
    try {
        const ponto = await controlePonto.listarPontosPorID(parseInt(req.params.id, 10));
        if (ponto) {
            res.status(200).json(ponto);
        } else {
            res.status(404).json([]);
        }
    } catch (err) {
        console.error("Erro ao obter ponto:", err);
        res.status(500).json({ erro: "Erro ao obter ponto" });
    }
});

rotasControlePonto.put("/fecharPonto/:id", autenticarJWT, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const pontoFechado = await controlePonto.fecharPonto(id);
        if (pontoFechado) return res.status(200).json(pontoFechado);
        return res.status(400).json('Ponto não encontrado');
    } catch (error) {
        console.log(error);
    }
})

rotasControlePonto.get("/contarSolicitacoesEmAberto", autenticarJWT, async (req, res) => {
    try {
        const solicitacoesAberto = await controlePonto.contarSolicitacoesEmAberto();
        return res.status(200).json({ total: solicitacoesAberto ?? 0 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao contar solicitações em aberto" });
    }
});


export default rotasControlePonto;