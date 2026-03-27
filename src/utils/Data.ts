export function dataAtualString() {
    const dataAtual = new Date();
    const data = dataAtual.toISOString().split("T")[0];

    return data;
}