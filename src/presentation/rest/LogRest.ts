import { Router } from "express";
import { LogService } from "../../services/LogService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasLog = Router();
const logService = new LogService();

rotasLog.get("/listarTodosLogs", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await logService.listarTodosLogs());
    } catch (err) {
        console.log(err);
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasLog.get("/listarLogPorID/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await logService.listarLogPorID(Number(req.params.id)));
    } catch (err) {
        if (err instanceof ErroAplicacao) { return res.status(err.statusCode).json({ erro: err.message }); }
    }
});

export default rotasLog;