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


const obtenerUrlBase = () => {
  const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = new URL(base);
  if (!url.port && process.env.PORT) url.port = String(process.env.PORT);
  return url.origin;
};

const escaparHtml = (valor = '') => String(valor).replace(/[&<>"']/g, caracter => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[caracter]));

// Notifica al médico y ofrece enlaces seguros para revisar la solicitud.
const emailNuevaSolicitudCita = async ({ medico, paciente, cita, token }) => {
  const baseUrl = obtenerUrlBase();
  const aceptarUrl = `${baseUrl}/citas/responder-correo/${encodeURIComponent(token)}/confirmada`;
  const rechazarUrl = `${baseUrl}/citas/responder-correo/${encodeURIComponent(token)}/cancelada`;
  const nombrePaciente = `${paciente.nombre} ${paciente.apellido}`;
  const fecha = escaparHtml(cita.fecha);
  const hora = escaparHtml(String(cita.hora).slice(0, 5));
  const motivo = escaparHtml(cita.motivo);

  await transporter.sendMail({
    from: 'SIGCMI SENA <noreply@sigcmi.com>',
    to: medico.email,
    subject: 'Nueva solicitud de cita médica - SIGCMI',
    text: `Hola Dr(a). ${medico.nombre}, ${nombrePaciente} ha solicitado una cita para el ${fecha} a las ${hora}. Motivo: ${cita.motivo}. Aceptar: ${aceptarUrl} Rechazar: ${rechazarUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;padding:26px;background:#fff;color:#1f2937">
        <div style="text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:18px;margin-bottom:22px">
          <h2 style="margin:0;color:#111827">SIGCMI</h2>
          <p style="margin:6px 0 0;color:#6b7280;font-size:13px">Nueva solicitud de cita médica</p>
        </div>
        <p>Hola, Dr(a). <strong>${escaparHtml(medico.nombre)} ${escaparHtml(medico.apellido)}</strong>:</p>
        <p>Un paciente ha solicitado una cita. Revisa la información y selecciona una decisión.</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;line-height:1.8">
          <p style="margin:0"><strong>Paciente:</strong> ${escaparHtml(nombrePaciente)}</p>
          <p style="margin:0"><strong>Correo:</strong> ${escaparHtml(paciente.email)}</p>
          <p style="margin:0"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin:0"><strong>Hora:</strong> ${hora}</p>
          <p style="margin:0"><strong>Especialidad:</strong> ${escaparHtml(cita.especialidad)}</p>
          <p style="margin:0"><strong>Motivo:</strong> ${motivo}</p>
        </div>
        <p style="margin:22px 0 12px;text-align:center;font-weight:bold">¿Qué deseas hacer con esta solicitud?</p>
        <div style="text-align:center">
          <a href="${aceptarUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 20px;border-radius:7px;font-weight:bold;margin:5px">Aceptar cita</a>
          <a href="${rechazarUrl}" style="display:inline-block;background:#b91c1c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:7px;font-weight:bold;margin:5px">Rechazar cita</a>
        </div>
        <p style="font-size:12px;color:#6b7280;line-height:1.5;margin-top:22px">Por seguridad, el enlace abre una página de confirmación antes de registrar tu decisión. El enlace vence en 7 días y solo puede utilizarse una vez.</p>
        <hr style="border:0;border-top:1px solid #e5e7eb;margin-top:24px" />
        <p style="font-size:11px;color:#9ca3af;text-align:center">Mensaje automático del sistema SIGCMI.</p>
      </div>`
  });
};

const emailEstadoCitaPaciente = async ({ paciente, medico, cita, estado }) => {
  const confirmada = estado === 'confirmada';
  const titulo = confirmada ? 'Tu cita ha sido confirmada' : 'Actualización de tu solicitud de cita';
  const mensaje = confirmada
    ? 'El médico ha aprobado tu solicitud. Tu cita quedó confirmada.'
    : 'El médico no pudo aprobar tu solicitud. Tu cita quedó cancelada.';
  const color = confirmada ? '#15803d' : '#b91c1c';
  const fecha = escaparHtml(cita.fecha);
  const hora = escaparHtml(String(cita.hora).slice(0, 5));

  await transporter.sendMail({
    from: 'SIGCMI SENA <noreply@sigcmi.com>',
    to: paciente.email,
    subject: `${titulo} - SIGCMI`,
    text: `Hola ${paciente.nombre}, ${mensaje} Médico: Dr(a). ${medico.nombre} ${medico.apellido}. Fecha: ${fecha}. Hora: ${hora}.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;padding:26px;background:#fff;color:#1f2937">
        <div style="text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:18px;margin-bottom:22px"><h2 style="margin:0;color:#111827">SIGCMI</h2></div>
        <h2 style="color:${color};font-size:21px">${titulo}</h2>
        <p>Hola, <strong>${escaparHtml(paciente.nombre)} ${escaparHtml(paciente.apellido)}</strong>.</p>
        <p>${mensaje}</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;line-height:1.8">
          <p style="margin:0"><strong>Médico:</strong> Dr(a). ${escaparHtml(medico.nombre)} ${escaparHtml(medico.apellido)}</p>
          <p style="margin:0"><strong>Especialidad:</strong> ${escaparHtml(cita.especialidad)}</p>
          <p style="margin:0"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin:0"><strong>Hora:</strong> ${hora}</p>
        </div>
        <p style="font-size:12px;color:#6b7280;margin-top:22px">Puedes consultar el estado actualizado ingresando a tu panel de paciente en SIGCMI.</p>
        <hr style="border:0;border-top:1px solid #e5e7eb;margin-top:24px" />
        <p style="font-size:11px;color:#9ca3af;text-align:center">Mensaje automático del sistema SIGCMI.</p>
      </div>`
  });
};

export { 
  emailRegistro, 
  emailOlvidePassword, 
  emailMedicoAprobado, 
  emailMedicoRechazado,
  emailNuevaSolicitudCita,
  emailEstadoCitaPaciente
};