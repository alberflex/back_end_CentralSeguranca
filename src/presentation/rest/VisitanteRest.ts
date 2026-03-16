import { Router } from "express";
import { VisitanteService } from "../../services/VisitanteService";
import { armazenamentoRedeMulter } from "../../utils/ArmazenamentoRede";
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

            const novoVisitante = await visitanteService.cadastrarVisitante(acesso);

            res.status(201).json(novoVisitante);
        } catch (err) {
            console.error("Erro ao cadastrar:", err);
            res.status(500).json({ erro: "Erro ao cadastrar visitante" });
        }
    }
);


rotasVisitante.put("/editarVisitante/:id",
    upload.fields([
        { name: "caminho_foto_visitante", maxCount: 1 },
        { name: "caminho_imagem_assinatura", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const acesso = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            if (!files?.caminho_foto_visitante || !files?.caminho_imagem_assinatura) return res.status(400).json({ erro: "Arquivos não enviados" });

            acesso.caminhoImagemVisitante = files["caminho_foto_visitante"][0].path;
            acesso.caminhoAssinaturaVisitante = files["caminho_imagem_assinatura"][0].path;

            const visitanteEditado = await visitanteService.editarVisitante(acesso, parseInt(req.params.id, 10));
            res.status(201).json(visitanteEditado);
        } catch (err) {
            console.error("Erro ao cadastrar:", err);
            res.status(500).json({ erro: "Erro ao editar visitante" });
        }
    });

rotasVisitante.delete("/deletarVisitante/:id", async (req, res) => {
    try {
        const deletado = await visitanteService.deletarVisitante(parseInt(req.params.id, 10))
        if (deletado) return res.status(200).json(deletado);

        return res.status(400).json('Visitante não encontrado');
    } catch (err) {
        console.error("Erro ao deletar:", err);
        res.status(404).json({ erro: "Visitante não encontrado" });
    }
});

rotasVisitante.get("/listarTodosVisitantes", async (req, res) => {
    try {
        const visitante = await visitanteService.listarTodosVisitantes();
        if (visitante) {
            res.status(200).json(visitante);
        } else {
            res.status(404).json({ erro: "Nenhum visitante cadastrado" });
        }
    } catch (err) {
        console.error("Erro ao obter visitante:", err);
        res.status(500).json({ erro: "Erro ao obter visitante" });
    }
});

rotasVisitante.get("/listarVisitantePorId/:id", async (req, res) => {
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
        console.error("Erro ao obter Visitante:", err);
        res.status(500).json({ erro: "Erro ao obter Visitante" });
    }
});

rotasVisitante.get("/selecionaPorCPF/:CPF", async (req, res) => {
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
        console.error(err);
        return res.status(500).json({ erro: "Erro ao obter visitante" });
    }
});

export default rotasVisitante;