import { Router } from "express";
import { PorteiroService } from "../../services/PorteiroService";
import { autenticarJWT } from "../../middleware/JWT";

const rotasPorteiro = Router();
const porteiroService = new PorteiroService();

rotasPorteiro.post("/cadastroPorteiro", async (req, res) => {
    const novoPorteiro = req.body;
    try {
        const cadastrado = await porteiroService.cadastrarPorteiro(novoPorteiro);
        if (cadastrado) return res.status(201).json(cadastrado);
        return res.status(400).json('Erro ao cadastrar porteiro');
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ erro: "Erro ao cadastrar porteiro" });
    }
});

rotasPorteiro.delete("/deletarPorteiro/:id", async (req, res) => {
    try {
        const deletado = await porteiroService.deletarPorteiro(parseInt(req.params.id, 10));
        if (deletado) return res.status(200).json(deletado);

        return res.status(400).json('Erro ao deletar porteiro');
    } catch (err) {
        console.error("Erro ao deletar:", err);
        res.status(404).json({ erro: "Porteiro não encontrado" });
    }
});

rotasPorteiro.get("/listarTodosPorteiros", async (req, res) => {
    try {
        const porteiro = await porteiroService.listarTodosPorteiros();
        if (porteiro) {
            res.status(200).json(porteiro);
        } else {
            res.status(404).json({ erro: "Nenhum porteiro cadastrado" });
        }
    } catch (err) {
        console.error("Erro ao obter porteiro:", err);
        res.status(500).json({ erro: "Erro ao obter porteiro" });
    }
});

rotasPorteiro.get("/listarPorteiroPorId/:id", async (req, res) => {
    try {
        const porteiro = await porteiroService.listarPorteiroPorId(parseInt(req.params.id, 10));
        if (porteiro) {
            res.status(200).json(porteiro);
        } else {
            res.status(404).json({ erro: "Porteiro não encontrado" });
        }
    } catch (err) {
        console.error("Erro ao obter porteiro:", err);
        res.status(500).json({ erro: "Erro ao obter porteiro" });
    }
});

rotasPorteiro.get("/buscarInformacoesAutenticacao", autenticarJWT, async (req, res) => {
    try {
        const { id } = (req as any).user;
        console.log('Informacoes ID', id);
        console.log('requisicao user:', (req as any).user);
        const porteiro = await porteiroService.listarPorteiroPorId(id);

        if (porteiro) return res.status(200).json(porteiro);
        return res.status(404).json({ erro: "Porteiro não encontrado" });
    } catch (err) {
        return res.status(500).json({ erro: "Erro ao obter Usuário" });
    }
});

rotasPorteiro.post("/login", async (req, res) => {
    const { chapa, senha } = req.body;
    try {
        const token = await porteiroService.login(chapa, senha);
        if (token) {
            res.status(200).json({ token });
        } else {
            res.status(401).json({ erro: "Credenciais inválidas" });
        }
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ erro: "Erro interno no login" });
    }
});

rotasPorteiro.put("/alterarSenha/:chapa", async (req, res) => {
    const { chapa } = req.params;
    const { senha } = req.body;
    try {
        const senhaAlterada = await porteiroService.alterarSenha(chapa, senha);
        if (senhaAlterada) return res.status(201).json(senhaAlterada);
        return res.status(400).json('Erro ao alterar a senha');
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno na alteração de senha" });
    }
})

rotasPorteiro.put("/editarPorteiro/:id", async (req, res) => {
    const { id } = req.params;
    const { senha, papel } = req.body;

    try {
        const porteiroAlterado = await porteiroService.editarUsuario(parseInt(id, 10), senha, papel);
        if (porteiroAlterado) return res.status(201).json(porteiroAlterado);
        return res.status(400).json('Erro ao alterar o porteiro');
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno na alteração de porteiro" });
    }
})

export default rotasPorteiro;