import { requestContext } from "../contexto/requisicaoContexto";
import { Request, Response, NextFunction } from "express";

export function contextoMiddleware(req: Request, res: Response, next: NextFunction) {
    requestContext.run({ user: req.user }, () => {
        next();
    });
}