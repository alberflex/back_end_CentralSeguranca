export function horaAtualBrasiliaString(): string {
    const agora = new Date();
    const horaBrasilia = agora.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
    });
    return horaBrasilia;
}