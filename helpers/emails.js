import nodemailer from "nodemailer";

// Crear el transporter SMTP con Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
});

const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  try {
    await transporter.sendMail({
      from: "SIGCMI SENA <noreply@sigcmi.com>",
      to: email,
      subject: "Confirma tu cuenta de SIGCMI SENA",
      text: "Confirma tu cuenta!",
      html: `
        <p>Hola ${nombre}, comprueba tu cuenta en SIGCMI SENA</p>
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
      from: "SIGCMI SENA <noreply@sigcmi.com>",
      to: email,
      subject: "Restablecer contraseña de SIGCMI SENA",
      text: "Restablecer contraseña!",
      html: `
        <p>Hola ${nombre}, restaura tu contraseña en SIGCMI SENA</p>
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

const emailMedicoAprobado = async (datos) => {
  const { email, nombre } = datos;

  try {
    await transporter.sendMail({
      from: "SIGCMI SENA <noreply@sigcmi.com>",
      to: email,
      subject: "¡Tu solicitud de registro ha sido Aprobada! - SIGCMI",
      text: `Hola Dr(a). ${nombre}, tu cuenta de médico en SIGCMI ha sido aprobada.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; background-color: #ffffff;">
          <h2 style="color: #1a1a1a; margin-top: 0;">¡Solicitud Aprobada! 🎉</h2>
          <p style="color: #4b5563; font-size: 15px;">Estimado(a) <strong>Dr(a). ${nombre}</strong>,</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
            Nos complace informarle que el equipo administrativo de <strong>SIGCMI</strong> ha revisado y aprobado su solicitud de registro profesional.
          </p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.BACKEND_URL}:${process.env.PORT}/login" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Iniciar Sesión en el Sistema
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Ya puede ingresar con sus credenciales registradas y gestionar su agenda médica.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center;">Este es un mensaje automático del sistema SIGCMI. Por favor no responda a este correo.</p>
        </div>
      `,
    });
    console.log(`👍 Correo de aprobación enviado a: ${email}`);
  } catch (error) {
    console.error("Error al enviar el correo de aprobación:", error.message);
  }
};

const emailMedicoRechazado = async (datos) => {
  const { email, nombre, motivo } = datos; // Capturamos el motivo

  try {
    await transporter.sendMail({
      from: "SIGCMI SENA <noreply@sigcmi.com>",
      to: email,
      subject: "Estado de tu solicitud de registro - SIGCMI",
      text: `Hola Dr(a). ${nombre}, tu solicitud de registro en SIGCMI no fue aprobada. Motivo: ${motivo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; background-color: #ffffff;">
          <h2 style="color: #dc2626; margin-top: 0;">Actualización de Solicitud de Registro</h2>
          <p style="color: #4b5563; font-size: 15px;">Estimado(a) <strong>Dr(a). ${nombre}</strong>,</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
            Lamentamos informarle que su solicitud de registro para acceder al sistema <strong>SIGCMI</strong> ha sido declinada tras la revisión de la documentación aportada.
          </p>

          <!-- Caja destacada con el motivo específico -->
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: bold; text-transform: uppercase;">Motivo del rechazo:</p>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #7f1d1d; line-height: 1.4;">${motivo || 'No se especificó un motivo.'}</p>
          </div>

          <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
            Si considera que se trata de un error o requiere realizar aclaraciones sobre la documentación, puede ponerse en contacto con el área administrativa.
          </p>
           <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.BACKEND_URL}:${process.env.PORT}/medicalRegistration" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Volver a crear la cuenta
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center;">Este es un mensaje automático del sistema SIGCMI. Por favor no responda a este correo.</p>
        </div>
      `,
    });
    console.log(`👎 Correo de rechazo enviado a: ${email}`);
  } catch (error) {
    console.error("Error al enviar el correo de rechazo:", error.message);
  }
};

export { 
  emailRegistro, 
  emailOlvidePassword, 
  emailMedicoAprobado, 
  emailMedicoRechazado 
};