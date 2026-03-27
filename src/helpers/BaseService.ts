import { getUser } from "../contexto/requisicaoContexto";
import { ErroAplicacao } from "../utils/Erros";

export abstract class BaseService {
    protected get user() {
        const user = getUser();

        if (!user) {
            throw new ErroAplicacao("Usuário não autenticado", 401);
        }

        return user;
    }
}