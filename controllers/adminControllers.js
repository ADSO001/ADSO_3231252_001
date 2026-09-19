import fs from 'fs';
import path from 'path';
import Usuario from "../models/usuarios.js";

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
    res.render("physicianManagement", {
        tituloPagina: "Panel de Administración"
    });
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

        // 2. Médicos ya aprobados (necesario para la tarjeta de estadísticas/listado)
        const medicosAprobados = await Usuario.findAll({
            where: {
                rol: 'medico',
                estado_aprobacion: 'aprobado'
            }
        });

        // 3. Renderizar la vista pasando ambas listas y el token CSRF
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
        }

        return res.redirect("/managementSpecialities");
    } catch (error) {
        console.error("Error al aprobar médico:", error);
        return res.redirect("/managementSpecialities");
    }
};

// Acción: Rechazar Médico (con borrado físico del archivo)
const rechazarMedico = async (req, res) => {
    const { id } = req.params;

    try {
        const medico = await Usuario.findOne({ where: { id, rol: 'medico' } });

        if (medico) {
            // Si el médico tiene un documento guardado en servidor, lo borramos de la carpeta
            if (medico.documento_verificacion) {
                const rutaDocumento = path.join(process.cwd(), 'public', 'uploads', 'documentos', medico.documento_verificacion);
                
                if (fs.existsSync(rutaDocumento)) {
                    fs.unlinkSync(rutaDocumento);
                }
            }

            // Borramos el registro de la BD
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