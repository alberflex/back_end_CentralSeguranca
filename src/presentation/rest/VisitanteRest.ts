import { Router } from "express";
import { VisitanteService } from "../../services/VisitanteService";
import { armazenamentoRedeMulter } from "../../utils/ArmazenamentoRede";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = armazenamentoRedeMulter("\\\\192.168.7.226\\c$\\CENTRALSEGURANCA\\VISITANTES\\IMAGENS\\");
const upload = multer({ storage: storage });
const rotasVisitante = Router();
const visitanteService = new VisitanteService();

rotasVisitante.post(
    "/cadastroVisitante",
    upload.fields([
        { name: "caminho_foto_visitante", maxCount: 1 },
    ]),
    autenticarJWT, contextoMiddleware,
    async (req, res) => {
        try {
            const acesso = req.body;
            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };

            if (!files?.caminho_foto_visitante) {
                return res.status(400).json({ erro: "Foto do visitante não enviada" });
            }
            acesso.caminho_foto_visitante = files.caminho_foto_visitante[0].path;

            return res.status(201).json(await visitanteService.cadastrarVisitante(acesso));
        } catch (err) {
            if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
        }
    }
);

rotasVisitante.put("/editarVisitante/:id",
    upload.fields([
        { name: "caminho_foto_visitante", maxCount: 1 }
    ]),
    autenticarJWT, contextoMiddleware,
    async (req, res) => {
        try {
            const acesso = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            if (!files?.caminho_foto_visitante) return res.status(400).json({ erro: "Arquivos não enviados" });

            acesso.caminhoImagemVisitante = files["caminho_foto_visitante"][0].path;

            return res.status(201).json(await visitanteService.editarVisitante(acesso, parseInt(req.params.id, 10)));
        } catch (err) {
            if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
        }
    });

rotasVisitante.delete("/deletarVisitante/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await visitanteService.deletarVisitante(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVisitante.get("/listarTodosVisitantes", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await visitanteService.listarTodosVisitantes());
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVisitante.get("/listarVisitantePorId/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const visitante = await visitanteService.listarVisitantePorId(parseInt(req.params.id, 10));
        if (!visitante) return res.status(200).json([]);

        if (visitante.caminho_foto_visitante) {
            try {
                const bufferFoto = await fs.promises.readFile(visitante.caminho_foto_visitante);
                const extensao = path.extname(visitante.caminho_foto_visitante).replace(".", "");

                visitante.caminho_foto_visitante = `data:image/${extensao};base64,${bufferFoto.toString("base64")}`;
            } catch (err) {
                console.error("Erro ao ler foto do visitante:", visitante.caminho_foto_visitante, err);
            }
        }
        return res.status(200).json(visitante);
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVisitante.get("/selecionaPorCPF/:CPF", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const visitante = await visitanteService.selecionaPorCPF(req.params.CPF);

        if (!visitante) return res.status(200).json([]);

        if (visitante.caminho_foto_visitante) {
            try {
                const bufferFoto = await fs.promises.readFile(visitante.caminho_foto_visitante);
                const extensao = path.extname(visitante.caminho_foto_visitante).replace(".", "");

                visitante.caminho_foto_visitante = `data:image/${extensao};base64,${bufferFoto.toString("base64")}`;
            } catch (err) {
                console.error("Erro ao ler foto do visitante:", visitante.caminho_foto_visitante, err);
            }
        }

        return res.status(200).json(visitante);
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVisitante.get("/dashboardVisitante", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await visitanteService.visitantesMaisPresentes());
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

export default rotasVisitante;