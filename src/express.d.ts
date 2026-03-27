import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        nome?: string;
        papel: string;
      };
    }
  }
}