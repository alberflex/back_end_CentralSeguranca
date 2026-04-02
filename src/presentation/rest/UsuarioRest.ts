import { Router } from "express";
import { UsuarioService } from "../../services/UsuarioService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasUsuario = Router();
const usuarioService = new UsuarioService();

rotasUsuario.get("/listarTodosUsuarios", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await usuarioService.listarTodosUsuarios());
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

export default rotasUsuario;