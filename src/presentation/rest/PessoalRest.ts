import { Router } from "express";
import { PessoalService } from "../../services/PessoalService";

const rotasPessoal = Router();
const pessoalService = new PessoalService();

rotasPessoal.get("/listarPessoal", async (req, res) => {
    try {
        const nome = req.query.nome as string | undefined; 
        const porteiro = await pessoalService.listarPessoal(nome);

        res.status(200).json(porteiro);
    } catch (err) {
        console.error("Erro ao obter pessoal:", err);
        res.status(500).json({ erro: "Erro ao obter pessoal" });
    }
});

export default rotasPessoal;