import fs from "fs";
import path from "path";

export async function arquivoParaBase64(caminhoArquivo?: string | null): Promise<string | null> {
    if (!caminhoArquivo) return null;

    try {
        const buffer = await fs.promises.readFile(caminhoArquivo);
        const extensao = path.extname(caminhoArquivo).substring(1);

        return `data:image/${extensao};base64,${buffer.toString("base64")}`;
    } catch (error) {
        console.error(`Erro ao ler arquivo ${caminhoArquivo}:`, error);
        return null;
    }
}
