import multer from 'multer';
import path from 'path';
import fs from 'fs';

export function armazenamentoRedeMulter(diretorio: string) {
    return multer.diskStorage({
        destination: (req, file, cb) => { cb(null, diretorio) },
        filename: (req: any, file, cb) => {
            const ext = path.extname(file.originalname);
            const nome = (req.body.caminho_imagem_veiculo || "VEICULO").replace(/\s+/g, "_").toUpperCase();

            const agora = new Date();
            const dataHora =
                agora.getFullYear().toString() +
                String(agora.getMonth() + 1).padStart(2, "0") +
                String(agora.getDate()).padStart(2, "0") + "_" +
                String(agora.getHours()).padStart(2, "0") +
                String(agora.getMinutes()).padStart(2, "0") +
                String(agora.getSeconds()).padStart(2, "0");

            let tipo = "arquivo";
            if (file.fieldname === "caminho_imagem_veiculo") {
                tipo = "FOTO";
            }

            const nomeArquivo = `${nome}_${tipo}_${dataHora}${ext}`;
            cb(null, nomeArquivo);
        }
    });
}

export async function removeArquivoRede(caminhoArquivo: string): Promise<void> {
    try {
        await fs.promises.access(caminhoArquivo);
        await fs.promises.unlink(caminhoArquivo);
    } catch (err) {
        console.error("Erro ao remover o arquivo:", err);
        throw new Error('Erro ao remover o arquivo');
    }
}