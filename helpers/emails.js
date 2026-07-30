import nodemailer from "nodemailer"

const emailRegistro = async (datos) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 5000, 
            socketTimeout: 5000
        });
await transporter.verify()
console.log('Conexión SMPT correcta 👍')
        const { email, nombre, token } = datos

        await transporter.sendMail({
            from: "Bienes Raices SENA <noreply@miproyecto.com>",
            to: email,
            subject: "Confirma tu cuenta de SIGMI SENA",
            text: "Confirma tu cuenta!",
            html: `
            <p>Hola ${nombre}, comprueba tu cuenta en SIGMI SENA</p>
            <p>Tu cuenta ya está lista, solo debes confirmar en el siguiente enlace: <a href="${process.env.BACKEND_URL}:${process.env.PORT}/confirmar/${token}">Confirmar cuenta</a></p>
            <p>Si no creaste la cuenta, omite este correo</p>
            `
        });
    } catch (error) {
        console.log("Error al enviar el correo de registro:", error);
    }
}

const emailOlvidePassword = async (datos) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            secure: false,
            connectionTimeout: 5000,
            socketTimeout: 5000
        });

        const { email, nombre, token } = datos

        await transporter.sendMail({
            from: "SIGMI SENA <noreply@miproyecto.com>",
            to: email,
            subject: "Restablecer contraseña de SIGMI SENA",
            text: "Restablecer contraseña!",
            html: `
            <p>Hola ${nombre}, restaura tu contraseña en SIGMI SENA</p>
            <p>Para cambiar la contraseña, solo debes seguir el siguiente enlace: <a href="${process.env.BACKEND_URL}:${process.env.PORT}/forgotPassword/${token}">Restablecer ahora</a></p>
            <p>Si no la pediste, ignora el mensaje</p>
            `
        });
        console.log('👍 correo enviado')
    } catch (error) {
        console.log("Error al enviar el correo de contraseña:", error);
    }
}

export { emailRegistro, emailOlvidePassword }