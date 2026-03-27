import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export function autenticarJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) throw new Error("Variável de ambiente do JWT nao configurado!");

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ erro: "Token inválido ou expirado" });

        (req as any).user = user;
        next();
    });
}

