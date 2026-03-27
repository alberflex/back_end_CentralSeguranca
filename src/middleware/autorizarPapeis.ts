import { Request, Response, NextFunction } from "express";
import { EPapelUsuario } from "../enums/EpapeisUsuario";
import dotenv from 'dotenv';

dotenv.config();

export function autorizarPapeis(...papeisPermitidos: EPapelUsuario[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const usuario = (req as any).user;
        if (!usuario || !usuario.papel) return res.status(403).json({ erro: "Usuário não autenticado ou papel não definido" })

        if (!papeisPermitidos.includes(usuario.papel)) return res.status(403).json({ erro: "Acesso negado: papel não autorizado" });

        next();
    };
}