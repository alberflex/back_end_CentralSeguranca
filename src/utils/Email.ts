import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class EmailService {
    private transporter = nodemailer.createTransport({
        host: process.env.HOST_EMAIL as string,
        port: Number(process.env.PORT_EMAIL),
        secure: false,
        auth: {
            user: process.env.USER_EMAIL as string,
            pass: process.env.PASSWORD_EMAIL as string,
        },
    } as SMTPTransport.Options);

    public async enviarEmail(destinatario: string, assunto: string, mensagem: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: '"Alberflex Comunicação" <informatica@alberflex.com.br>',
                to: destinatario,
                subject: assunto,
                text: mensagem,
                html: `<p>${mensagem}</p>`,
            });
            console.log(`E-mail enviado: ${info.messageId}`);
        } catch (erro) {
            console.error(`Erro ao enviar e-mail:`, erro);
            throw erro;
        }
    }
}
