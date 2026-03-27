import { Router } from "express";
import { PorteiroService } from "../../services/PorteiroService";
import { autenticarJWT } from "../../middleware/JWT";
import { ErroAplicacao } from "../../utils/Erros";
import { contextoMiddleware } from "../../middleware/contexto";

const rotasPorteiro = Router();
const porteiroService = new PorteiroService();

rotasPorteiro.post("/cadastroPorteiro", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(201).json(await porteiroService.cadastrarPorteiro(req.body));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message });
    }
});

rotasPorteiro.delete("/deletarPorteiro/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await porteiroService.deletarPorteiro(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasPorteiro.get("/listarTodosPorteiros", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await porteiroService.listarTodosPorteiros());
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasPorteiro.get("/listarPorteiroPorId/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        return res.status(200).json(await porteiroService.listarPorteiroPorId(parseInt(req.params.id, 10)));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasPorteiro.get("/buscarInformacoesAutenticacao", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { id } = (req as any).user;
        return res.status(200).json(await porteiroService.listarPorteiroPorId(id));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasPorteiro.post("/login", async (req, res) => {
    const { chapa, senha } = req.body;
    try {
        return res.status(200).json({token: await porteiroService.login(chapa, senha)});
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
});

rotasPorteiro.put("/alterarSenha/:chapa", async (req, res) => {
    const { chapa } = req.params;
    const { senha } = req.body;
    try {
        return res.status(201).json(await porteiroService.alterarSenha(chapa, senha));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
})

rotasPorteiro.put("/editarPorteiro/:id", autenticarJWT, contextoMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { senha, papel } = req.body;
        return res.status(201).json(await porteiroService.editarUsuario(parseInt(id, 10), senha, papel));
    } catch (err) {
        if (err instanceof ErroAplicacao) return res.status(err.statusCode).json({ erro: err.message })
    }
})

export default rotasPorteiro;