import { Router } from "express";
import { UsuarioPontoService } from "../../services/UsuarioPonto";
import { autenticarJWT } from "../../middleware/JWT";

const rotasUsuarioPonto = Router();
const porteiroService = new UsuarioPontoService();

rotasUsuarioPonto.get("/listarTodosUsuariosPontos", autenticarJWT, async (req, res) => {
    try {
        const usuarioPonto = await porteiroService.listarTodosUsuariosPonto();
        if (usuarioPonto) {
            res.status(200).json(usuarioPonto);
        } else {
            res.status(404).json({ erro: "Nenhum usuario ponto cadastrado" });
        }
    } catch (err) {
        console.error("Erro ao obter usuarioPonto:", err);
        res.status(500).json({ erro: "Erro ao usuarioPonto" });
    }
});

export default rotasUsuarioPonto;