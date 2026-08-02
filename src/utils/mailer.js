import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port:env.MAIL_PORT,
    secure: false,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS
    }
})

export const sendConfirmationEmail = async ({ to, eventTitle, reservationCode, quantity }) => {
    try {
        await transporter.sendMail({
            from: env.MAIL_FROM,
            to,
            subject: `Confirmación de inscripción - ${eventTitle}`,
            html: `
                <h2>¡Inscripción confirmada!</h2>
                <p>Te inscribiste a <strong>${eventTitle}</strong>.</p>
                <p>Cantidad de entradas: ${quantity}</p>
                <p>Código de reserva: <strong>${reservationCode}</strong></p>
            `
        })
    } catch (error) {
        console.log('Error al enviar email:', error.message)
    }
}