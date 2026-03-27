import { Router } from "express";
import { VeiculoService } from "../../services/VeiculoService";
import { armazenamentoRedeMulter } from "../../utils/ArmazenamentoRede";
import { ErroAplicacao } from "../../utils/Erros";
import { autenticarJWT } from "../../middleware/JWT";
import { contextoMiddleware } from "../../middleware/contexto";
import multer from "multer";

const storage = armazenamentoRedeMulter("\\\\192.168.7.226\\c$\\CENTRALSEGURANCA\\VEICULOS");
const upload = multer({ storage: storage });
const rotasVeiculo = Router();
const veiculoService = new VeiculoService();

rotasVeiculo.post("/cadastroVeiculo", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(201).json(await veiculoService.cadastrarVeiculo(req.body));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVeiculo.put("/editarVeiculo/:id",
    upload.fields([{ name: "caminho_imagem_veiculo" }]),
    autenticarJWT, contextoMiddleware,
    async (req, res) => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files?.caminho_imagem_veiculo) return res.status(400).json({ erro: "Foto do veiculo não enviada" });

            const veiculos = {
                km_atual: Number(req.body.km_atual),
                modelo: req.body.modelo,
                caminhoImagem: files.caminho_imagem_veiculo[0].path
            };

            return res.status(200).json(await veiculoService.editarVeiculo(veiculos, parseInt(req.params.id, 10)));
        } catch (err) {
            if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
        }
    }
);

rotasVeiculo.delete("/deletarVeiculo/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        res.status(200).json(await veiculoService.deletarVeiculo(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVeiculo.get("/listarTodosVeiculos", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { placa } = req.query;

        return res.status(200).json(await veiculoService.listarTodosVeiculos(placa as string));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVeiculo.get("/dashboardVeiculo", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await veiculoService.veiculosMaisUtilizados());
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasVeiculo.get("/listarVeiculoPorId/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await veiculoService.listarVeiculoPorId(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

export default rotasVeiculo;
