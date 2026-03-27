import { Router } from "express";
import { PessoalService } from "../../services/PessoalService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasPessoal = Router();
const pessoalService = new PessoalService();

rotasPessoal.get("/listarPessoal", autenticarJWT, contextoMiddleware,  async (req, res) => {
    try {
        return res.status(200).json(await pessoalService.listarPessoal(req.query.nome as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

export default rotasPessoal;