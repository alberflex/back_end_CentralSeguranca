import { Router } from "express";
import { ControleAcessoService } from "../../services/ControleAcessoService";
import { autenticarJWT } from "../../middleware/JWT";

const rotasControleAcesso = Router();
const controleAcesso = new ControleAcessoService();

rotasControleAcesso.post("/cadastrarControleAcesso",
    autenticarJWT,
    async (req, res) => {
        try {
            const novoCadastro = await controleAcesso.cadastroAcesso(req.body);
            if (novoCadastro) return res.status(201).json(novoCadastro);

            return res.status(400).json('Erro ao cadastrar acesso');
        } catch (err) {
            console.error("Erro ao cadastrar:", err);
            res.status(500).json({ erro: "Erro ao cadastrar ponto" });
        }
    });

rotasControleAcesso.delete("/deletarControleAcesso/:id", async (req, res) => {
    try {
        const deletado = await controleAcesso.deletarControleAcesso(parseInt(req.params.id, 10));

        if (!deletado) {
            return res.status(404).json({ erro: "Registro não encontrado ou já deletado" });
        }

        return res.status(200).json(deletado);
    } catch (err: any) {
        console.error("Erro ao deletar:", err);
        return res.status(500).json({ erro: err.message || "Erro ao deletar controle acesso" });
    }
});

rotasControleAcesso.get("/listarControleAcesso", async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        const pontos = await controleAcesso.listarTodosControlesAcessos(dataInicio as string, dataFim as string);
        if (pontos) {
            res.status(200).json(pontos);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error("Erro ao obter controles acessos:", err);
        res.status(500).json({ erro: "Erro ao obter controles acessos" });
    }
});

rotasControleAcesso.get("/listarControleAcessoPorId/:id", async (req, res) => {
    try {
        const controleAcessoListado = await controleAcesso.listarControleAcessoPorID(parseInt(req.params.id, 10));
        if (controleAcessoListado) {
            res.status(200).json(controleAcessoListado);
        } else {
            res.status(404).json([]);
        }
    } catch (err) {
        console.error("Erro ao obter controles acessos:", err);
        res.status(500).json({ erro: "Erro ao obter controles acessos por id" });
    }
});


rotasControleAcesso.get("/descobreVisitanteID/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const visitanteId = await controleAcesso.descobreVisitanteID(id);

        if (visitanteId !== null) {
            return res.status(200).json({ idVisitante: visitanteId });
        }

        return res.status(404).json({ erro: "Visitante não encontrado" });
    } catch (err) {
        console.error("Erro ao obter visitante:", err);
        return res.status(500).json({ erro: "Erro ao obter visitante por id" });
    }
});


rotasControleAcesso.put("/fecharControleAcesso/:id", async (req, res) => {
    try {
        const { idPorteiroSaida } = req.body;
        const controleAcessoFechado = await controleAcesso.fecharControleAcesso(parseInt(req.params.id), idPorteiroSaida)

        if (controleAcessoFechado) return res.status(200).json(controleAcessoFechado);

        return res.status(400).json('Controle acesso não encontrado');
    } catch (error) {
        console.error("Erro ao obter fechar o controle de acesso:", error);
        res.status(500).json({ erro: "Erro ao fechar o controle de acesso" });
    }
})

rotasControleAcesso.get("/contarSolicitacoesEmAberto", async (req, res) => {
    try {
        const solicitacoesAberto = await controleAcesso.contarAcessosEmAberto();

        return res.status(200).json({ total: solicitacoesAberto ?? 0 });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao contar solicitações em aberto" });
    }
});

export default rotasControleAcesso;