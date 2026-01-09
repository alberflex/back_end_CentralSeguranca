import { Porteiro } from "../domain";
import { PorteiroResource } from "../resources/PorteiroResource";
import { Bcrypt } from "../utils/Bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export class PorteiroService {
    private porteiroResource: PorteiroResource;

    constructor() { this.porteiroResource = new PorteiroResource() }

    public async cadastrarPorteiro(porteiro: Porteiro): Promise<Porteiro | null> {
        const bcrypt = new Bcrypt();
        porteiro.senha = await bcrypt.hashSenha(porteiro.senha);
        return this.porteiroResource.cadastrarPorteiro(porteiro);
    }

    public async alterarSenha(chapa: string, senha: string): Promise<Porteiro | null> {
        const usuario = await this.porteiroResource.buscarPorChapa(chapa);
        if (usuario) {
            const bcrypt = new Bcrypt();
            const senhaEncriptada = await bcrypt.hashSenha(senha);
            return this.porteiroResource.alterarSenha(chapa, senhaEncriptada);
        }
        return null;
    }

    public async login(chapa: string, senha: string): Promise<string | null> {
        const usuario = await this.porteiroResource.buscarPorChapa(chapa);

        const bcrypt = new Bcrypt();

        if (!usuario) return null;
        const senhaValida = await bcrypt.compareSenha(senha, usuario.senha);

        if (!senhaValida) return null;
        const token = jwt.sign(
            { id: usuario.id, cpf: usuario.cpf, papel: usuario.papel, }, process.env.JWT_SECRET || "default",
            { expiresIn: "1h" }
        );
        return token;
    }

    public deletarPorteiro(id: number): Promise<Porteiro | null> {
        return this.porteiroResource.deletarPorteiro(id);
    }

    public listarTodosPorteiros(): Promise<Porteiro[]> {
        return this.porteiroResource.listarTodosPorteiros();
    }

    public listarPorteiroPorId(id: number): Promise<Porteiro | null> {
        return this.porteiroResource.listarPorteiroPorId(id);
    }

    public async editarUsuario(id: number, senha: string | null, papel: string): Promise<Porteiro | null> {
        let senhaEncriptada: string | null = null;

        if (senha && senha.trim() !== "") {
            const bcrypt = new Bcrypt();
            senhaEncriptada = await bcrypt.hashSenha(senha);
        }

        return this.porteiroResource.editarUsuario(id, senhaEncriptada, papel);
    }
}