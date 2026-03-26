import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const auditMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuario = (req as any).user?.id || "desconhecido";

            logger.info({
                acao: `${req.method}_${req.path}`,
                usuario,
                data: new Date(),
                method: req.method,
                path: req.path,
                body: req.body,
                params: req.params,
                query: req.query
            });

        } catch (error) {
            logger.error({
                acao: "ERRO_LOG_AUDITORIA",
                erro: (error as Error).message
            });
        } finally {
            next();
        }
    };
};