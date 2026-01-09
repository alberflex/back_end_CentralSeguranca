import bcrypt from 'bcryptjs';

export class Bcrypt {

    public async hashSenha(senha: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(senha, saltRounds);
    }

    public async compareSenha(compareSenha: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(compareSenha, hashedPassword);
    }
}