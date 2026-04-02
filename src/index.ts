import cors from "cors";
import express from "express";
import dotenv from 'dotenv';
import rotasVeiculo from "./presentation/rest/VeiculoRest";
import rotasControlePonto from "./presentation/rest/ControlePontoRest";
import rotasControleVeiculo from "./presentation/rest/ControleVeiculoRest";
import rotasVisitante from "./presentation/rest/VisitanteRest";
import rotasControleAcesso from "./presentation/rest/ControleAcessoRest";
import rotasPorteiro from "./presentation/rest/PorteiroRest";
import rotasUsuarioPonto from "./presentation/rest/UsuarioPontoRest";
import rotasPessoal from "./presentation/rest/PessoalRest";
import rotasLog from "./presentation/rest/LogRest";
import rotasUsuario from "./presentation/rest/UsuarioRest";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.use("/porteiro", rotasPorteiro);
app.use("/veiculo", rotasVeiculo);
app.use("/visitante", rotasVisitante);
app.use("/controlePonto", rotasControlePonto);
app.use("/controleVeiculo", rotasControleVeiculo);
app.use("/controleAcesso", rotasControleAcesso);
app.use("/usuarioPonto", rotasUsuarioPonto);
app.use("/pessoal", rotasPessoal);
app.use("/usuario", rotasUsuario)
app.use("/log", rotasLog);

app.listen(process.env.PORT_APP || null, () => { console.log(`Servidor rodando em http://localhost:${process.env.PORT_APP || null}`); });

export default app;