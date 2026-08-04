import nodemailer from "nodemailer";

// Crear el transporter fuera de las funciones para reutilizar la conexión
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // Debe ser false para los puertos 2525, 587 o 25
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Permite conexiones locales sin validar certificados estrictos
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
});

const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  try {
    await transporter.sendMail({
      from: "Bienes Raices SENA <noreply@miproyecto.com>",
      to: email,
      subject: "Confirma tu cuenta de SIGMI SENA",
      text: "Confirma tu cuenta!",
      html: `
        <p>Hola ${nombre}, comprueba tu cuenta en SIGMI SENA</p>
        <p>Tu cuenta ya está lista, solo debes confirmar en el siguiente enlace: 
           <a href="${process.env.BACKEND_URL}:${process.env.PORT}/confirmar/${token}">Confirmar cuenta</a>
        </p>
        <p>Si no creaste la cuenta, omite este correo</p>
      `,
    });
    console.log("👍 Correo de registro enviado correctamente");
  } catch (error) {
    console.error("Error al enviar el correo de registro:", error.message);
  }
};

const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  try {
    await transporter.sendMail({
      from: "SIGMI SENA <noreply@miproyecto.com>",
      to: email,
      subject: "Restablecer contraseña de SIGMI SENA",
      text: "Restablecer contraseña!",
      html: `
        <p>Hola ${nombre}, restaura tu contraseña en SIGMI SENA</p>
        <p>Para cambiar la contraseña, solo debes seguir el siguiente enlace: 
           <a href="${process.env.BACKEND_URL}:${process.env.PORT}/forgotPassword/${token}">Restablecer ahora</a>
        </p>
        <p>Si no la pediste, ignora el mensaje</p>
      `,
    });
    console.log("👍 Correo de restablecimiento enviado correctamente");
  } catch (error) {
    console.error("Error al enviar el correo de contraseña:", error.message);
  }
};

export { emailRegistro, emailOlvidePassword };