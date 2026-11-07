import fs from 'fs';
import path from 'path';
import Usuario from "../models/usuarios.js";
import { Cita } from '../models/index.js';
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


const formatLocal = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const obtenerDiasSemana = (fechaReferencia) => {
   
    let fecha = fechaReferencia ? new Date(`${fechaReferencia}T12:00:00`) : new Date();
    let diaSemana = fecha.getDay();
    let diferencia = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); 
    
    let lunes = new Date(fecha.setDate(diferencia));
    let dias = [];
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for (let i = 0; i < 7; i++) {
        let dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        dias.push({
            nombre: nombresDias[dia.getDay()],
            fechaISO: formatLocal(dia), 
            texto: `${dia.getDate()} ${nombresDias[dia.getDay()].substring(0,3)}`
        });
    }
    return dias;
};


const formularioDoctorsHours = async (req, res) => {
    try {
        const medicos = await Usuario.findAll({
            where: { rol: 'medico', estado_aprobacion: 'aprobado' },
            attributes: ['id', 'nombre', 'apellido', 'especialidad', 'horarios']
        });

        
        const { medicoId, fecha } = req.query;
        const diasSemana = obtenerDiasSemana(fecha);
        
        let citasMedico = [];
        let medicoSeleccionado = null;

        if (medicoId) {
            medicoSeleccionado = await Usuario.findByPk(medicoId);
            
           
            citasMedico = await Cita.findAll({
                where: { medico_id: medicoId, estado: 'pendiente' },
                include: [{ model: Usuario, as: 'paciente', attributes: ['nombre', 'apellido'] }]
            });
        }

        const fechaActualObj = new Date(`${diasSemana[0].fechaISO}T12:00:00`);
        const semAnterior = new Date(fechaActualObj); 
        semAnterior.setDate(semAnterior.getDate() - 7);
        const semSiguiente = new Date(fechaActualObj); 
        semSiguiente.setDate(semSiguiente.getDate() + 7);

        res.render("doctorsHours", {
            tituloPagina: "Control de Horarios - SIGCMI",
            medicos,
            medicoSeleccionado,
            citas: citasMedico,
            diasSemana, 
            fechaAnterior: formatLocal(semAnterior),
            fechaSiguiente: formatLocal(semSiguiente)
        });

    } catch (error) {
        console.error("Error al cargar horarios:", error);
        res.redirect("/adminPanel");
    }
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