import { Router } from "express";
import { UsuarioPontoService } from "../../services/UsuarioPonto";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasUsuarioPonto = Router();
const porteiroService = new UsuarioPontoService();

rotasUsuarioPonto.get("/listarTodosUsuariosPontos", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await porteiroService.listarTodosUsuariosPonto());
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

export default rotasUsuarioPonto;