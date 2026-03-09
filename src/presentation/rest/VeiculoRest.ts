import { Router } from "express";
import { VeiculoService } from "../../services/VeiculoService";
import { autenticarJWT } from "../../middleware/JWT";

const rotasVeiculo = Router();
const veiculoService = new VeiculoService();

rotasVeiculo.post("/cadastroVeiculo", async (req, res) => {
    try {
        const cadastrado = await veiculoService.cadastrarVeiculo(req.body);
        if (cadastrado) return res.status(201).json(cadastrado);

        return res.status(400).json('Erro ao cadastrar veiculo');
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ erro: "Erro ao cadastrar veiculo" });
    }
});

rotasVeiculo.delete("/deletarVeiculo/:id", async (req, res) => {
    try {
        const deletado = await veiculoService.deletarVeiculo(parseInt(req.params.id, 10));

        res.status(200).json(deletado);
    } catch (err) {
        console.error("Erro ao deletar:", err);
        res.status(404).json({ erro: "Veiculo não encontrado" });
    }
});

rotasVeiculo.get("/listarTodosVeiculos", async (req, res) => {
    try {
        const { placa } = req.query;
        const veiculo = await veiculoService.listarTodosVeiculos(placa as string);

        if (veiculo) {
            res.status(200).json(veiculo);
        } else {
            res.status(404).json({ erro: "Nenhum veiculo cadastrado" });
        }
    } catch (err) {
        console.error("Erro ao obter veiculo:", err);
        res.status(500).json({ erro: "Erro ao obter veiculo" });
    }
});


rotasVeiculo.get("/listarVeiculoPorId/:id", async (req, res) => {
    try {
        const veiculo = await veiculoService.listarVeiculoPorId(parseInt(req.params.id, 10));

        if (veiculo) {
            res.status(200).json(veiculo);
        } else {
            res.status(404).json({ erro: "Veiculo não encontrado" });
        }
    } catch (err) {
        console.error("Erro ao obter Veiculo:", err);
        res.status(500).json({ erro: "Erro ao obter Veiculo" });
    }
});

export default rotasVeiculo;
