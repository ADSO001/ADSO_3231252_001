import fs from 'fs';
import path from 'path';
import Usuario from "../models/usuarios.js";
// Importamos los helpers de email (asegúrate de que la ruta relativa coincida con tu carpeta)
import { emailMedicoAprobado, emailMedicoRechazado } from "../helpers/emails.js";

const formularioAdmin = (req, res) => {
    res.render("adminPanel", {
        tituloPagina: "Panel de Administración"
    });
};

const formularioAdminAppointment = (req, res) => {
    res.render("appointmentScheduleAdmin", {
        tituloPagina: "Panel de Administración"
    });
};

const formularioDoctorsHours = (req, res) => {
    res.render("doctorsHours", {
        tituloPagina: "Panel de Administración"
    });
};

const formulariopatientManagement = (req, res) => {
    res.render("patientManagement", {
        tituloPagina: "Panel de Administración"
    });
};

const managementDoctors = async (req, res) => {
    try {
        const medicosAprobados = await Usuario.findAll({
            where: {
                rol: 'medico',
                estado_aprobacion: 'aprobado'
            }
        });

        res.render("physicianManagement", {
            tituloPagina: "Gestión de Médicos",
            usuario: req.usuario,
            medicos: medicosAprobados
        });
    } catch (error) {
        console.error("Error al cargar los médicos aprobados:", error);
        res.redirect("/adminPanel");
    }
};

// Renderizar solicitudes pendientes en managementSpecialities.pug
const confirmDoctors = async (req, res) => {
    try {
        // 1. Médicos pendientes de aprobación
        const medicosPendientes = await Usuario.findAll({
            where: {
                rol: 'medico',
                estado_aprobacion: 'pendiente'
            }
        });

        // 2. Médicos ya aprobados
        const medicosAprobados = await Usuario.findAll({
            where: {
                rol: 'medico',
                estado_aprobacion: 'aprobado'
            }
        });

        // 3. Renderizar la vista
        res.render("managementSpecialities", {
            tituloPagina: "Aprobación de Médicos",
            usuario: req.usuario,
            csrfToken: req.csrfToken ? req.csrfToken() : null,
            medicosPendientes,
            medicosAprobados
        });

    } catch (error) {
        console.error("Error al obtener médicos pendientes:", error);
        res.redirect("/adminPanel");
    }
};

// Acción: Aprobar Médico
const aprobarMedico = async (req, res) => {
    const { id } = req.params;

    try {
        const medico = await Usuario.findOne({ where: { id, rol: 'medico' } });

        if (medico) {
            medico.estado_aprobacion = 'aprobado';
            await medico.save();

            // Enviar correo de notificación al médico
            await emailMedicoAprobado({
                email: medico.email,
                nombre: `${medico.nombre} ${medico.apellido}`
            });
        }

        return res.redirect("/managementSpecialities");
    } catch (error) {
        console.error("Error al aprobar médico:", error);
        return res.redirect("/managementSpecialities");
    }
};

// Acción: Rechazar Médico (con envío de correo y borrado físico del archivo/registro)
const rechazarMedico = async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body; // Viene del formulario dentro del modal

    try {
        const medico = await Usuario.findOne({ where: { id, rol: 'medico' } });

        if (medico) {
            // 1. Enviar el correo con el motivo antes de borrar el registro
            await emailMedicoRechazado({
                email: medico.email,
                nombre: `${medico.nombre} ${medico.apellido}`,
                motivo: motivo || "No se detallaron motivos específicos."
            });

            // 2. Borrar archivo físico si existe
            if (medico.documento_verificacion) {
                const rutaDocumento = path.join(process.cwd(), 'public', 'uploads', 'documentos', medico.documento_verificacion);
                
                if (fs.existsSync(rutaDocumento)) {
                    fs.unlinkSync(rutaDocumento);
                }
            }

            // 3. Borrar el registro de la BD
            await medico.destroy();
        }

        return res.redirect("/managementSpecialities");
    } catch (error) {
        console.error("Error al rechazar médico:", error);
        return res.redirect("/managementSpecialities");
    }
};

export {
    formularioAdmin, 
    managementDoctors, 
    formularioAdminAppointment, 
    formularioDoctorsHours, 
    formulariopatientManagement, 
    confirmDoctors, 
    aprobarMedico, 
    rechazarMedico
};