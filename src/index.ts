import cors from "cors";
import express from "express";
import dotenv from 'dotenv';
import rotasVeiculo from "./presentation/rest/VeiculoRest";
import requestLogger from "./middleware/requestLogger";
import rotasControlePonto from "./presentation/rest/ControlePontoRest";
import rotasControleVeiculo from "./presentation/rest/ControleVeiculoRest";
import rotasVisitante from "./presentation/rest/VisitanteRest";
import rotasControleAcesso from "./presentation/rest/ControleAcessoRest";
import rotasPorteiro from "./presentation/rest/PorteiroRest";
import rotasUsuarioPonto from "./presentation/rest/UsuarioPontoRest";
import rotasPessoal from "./presentation/rest/PessoalRest";
import { logRequestDetails } from "./middleware/logRequestDetails";
import { auditMiddleware } from "./middleware/log";

dotenv.config();

const app = express();
const port = process.env.PORT_APP || null;
app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());
app.use(requestLogger); 
app.use(logRequestDetails); 


app.listen(port, () => { console.log(`Servidor rodando em http://localhost:${port}`); });
app.use("/porteiro", rotasPorteiro);
app.use("/veiculo", rotasVeiculo);
app.use("/visitante", rotasVisitante);
app.use("/controlePonto", rotasControlePonto);
app.use("/controleVeiculo", rotasControleVeiculo);
app.use("/controleAcesso", rotasControleAcesso);
app.use("/usuarioPonto", rotasUsuarioPonto);
app.use("/pessoal", rotasPessoal);


export default app;