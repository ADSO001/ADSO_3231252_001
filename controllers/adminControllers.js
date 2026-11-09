import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import moment from 'moment-timezone';

import Usuario from "../models/usuarios.js";
import { Cita, HistoriaClinica } from '../models/index.js';
import { emailMedicoAprobado, emailMedicoRechazado } from "../helpers/emails.js";

// Función del Dashboard Principal con Métricas y Citas de Hoy
const formularioAdmin = async (req, res) => {
    try {
        const zonaHoraria = 'America/Bogota';
        const hoyInicio = moment().tz(zonaHoraria).startOf('day').toDate();
        const hoyFin = moment().tz(zonaHoraria).endOf('day').toDate();

        const [
            totalCitas,
            citasHoy,
            citasPendientes,
            citasConfirmadas,
            citasCompletadas,
            citasCanceladas,
            totalUsuarios,
            totalClientes,
            citasDelDia
        ] = await Promise.all([
            Cita.count(),
            Cita.count({
                where: {
                    fecha: {
                        [Op.between]: [hoyInicio, hoyFin]
                    }
                }
            }),
            Cita.count({ where: { estado: 'pendiente' } }),
            Cita.count({ where: { estado: 'confirmada' } }),
            Cita.count({ where: { estado: 'completada' } }),
            Cita.count({ where: { estado: 'cancelada' } }),
            Usuario.count(),
            Usuario.count({ where: { rol: 'paciente' } }).catch(() => 0),
            Cita.findAll({
                where: {
                    fecha: {
                        [Op.between]: [hoyInicio, hoyFin]
                    }
                },
                include: [
                    { model: Usuario, as: 'paciente', attributes: ['nombre', 'apellido', 'email'] },
                    { model: Usuario, as: 'medico', attributes: ['nombre', 'apellido'] }
                ],
                order: [['hora', 'ASC']]
            })
        ]);

        res.render("adminPanel", {
            tituloPagina: "Panel de Administración",
            usuario: req.usuario,
            metricas: {
                totalCitas,
                citasHoy,
                citasPendientes,
                citasConfirmadas,
                citasCompletadas,
                citasCanceladas,
                totalUsuarios,
                totalClientes
            },
            citasDelDia
        });
    } catch (error) {
        console.error("Error al cargar el dashboard del administrador:", error);
        res.render("adminPanel", {
            tituloPagina: "Panel de Administración",
            usuario: req.usuario,
            metricas: {
                totalCitas: 0, citasHoy: 0, citasPendientes: 0,
                citasConfirmadas: 0, citasCompletadas: 0, citasCanceladas: 0,
                totalUsuarios: 0, totalClientes: 0
            },
            citasDelDia: []
        });
    }
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
            texto: `${dia.getDate()} ${nombresDias[dia.getDay()].substring(0, 3)}`
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

const formulariopatientManagement = async (req, res) => {
    try {
        const pacientes = await Usuario.findAll({
            where: { rol: 'paciente' },
            attributes: ['id', 'nombre', 'apellido', 'tipo_documento', 'numero_documento', 'email', 'telefono', 'fecha_nacimiento', 'genero']
        });

        res.render('patientManagement', {
            tituloPagina: 'Gestión de Pacientes',
            usuario: req.usuario,
            pacientes
        });
    } catch (error) {
        console.error('Error al listar pacientes:', error);
        res.status(500).send('Error al obtener la lista de pacientes');
    }
};

const detallePaciente = async (req, res) => {
    const { id } = req.params;
    try {
        const paciente = await Usuario.findOne({
            where: { id, rol: 'paciente' },
            include: [
                {
                    model: Cita,
                    as: 'citasPaciente',
                    include: [
                        {
                            model: Usuario,
                            as: 'medico',
                            attributes: ['nombre', 'apellido', 'especialidad']
                        },
                        {
                            model: HistoriaClinica,
                            as: 'historia'
                        }
                    ]
                },
                {
                    model: HistoriaClinica,
                    as: 'historiasPaciente'
                }
            ],
            order: [
                [{ model: Cita, as: 'citasPaciente' }, 'fecha', 'DESC'],
                [{ model: Cita, as: 'citasPaciente' }, 'hora', 'DESC']
            ]
        });

        if (!paciente) {
            return res.redirect('/patientManagement');
        }

        res.render('paciente_detalle', {
            tituloPagina: `Expediente: ${paciente.nombre} ${paciente.apellido}`,
            usuario: req.usuario,
            paciente
        });
    } catch (error) {
        console.error('Error al cargar expediente:', error);
        res.status(500).send('Error al cargar el expediente del paciente');
    }
};

const verHistoriaClinica = async (req, res) => {
    const { id } = req.params;
    
    try {
        const historia = await HistoriaClinica.findByPk(id, {
            include: [
                { 
                    model: Usuario, 
                    as: 'paciente'
                },
                { 
                    model: Usuario, 
                    as: 'medico', 
                    attributes: ['nombre', 'apellido', 'especialidad', 'tarjeta_profesional'] 
                },
                { 
                    model: Cita, 
                    as: 'cita' 
                }
            ]
        });

        if (!historia) {
            return res.redirect('/patientManagement');
        }

        let edadPaciente = null;
        if (historia.paciente && historia.paciente.fecha_nacimiento) {
            const hoy = new Date();
            const fechaNac = new Date(historia.paciente.fecha_nacimiento);
            edadPaciente = hoy.getFullYear() - fechaNac.getFullYear();
            const m = hoy.getMonth() - fechaNac.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
                edadPaciente--;
            }
        }

        let datos = historia.datos_clinicos || {};
        if (typeof datos === 'string') {
            try { datos = JSON.parse(datos); } catch (e) { datos = {}; }
        }
        
        let secciones = historia.secciones || [];

        res.render('templates/clinical-history-detail', {
            tituloPagina: 'Detalle de Historia Clínica',
            usuario: req.usuario,
            historia: historia,
            paciente: historia.paciente,
            medico: historia.medico,
            cita: historia.cita,
            edadPaciente: edadPaciente,
            datos: datos,
            secciones: secciones
        });

    } catch (error) {
        console.error('Error al cargar la historia clínica:', error);
        res.status(500).send('Error interno al cargar el documento');
    }
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

const confirmDoctors = async (req, res) => {
    try {
        const medicosPendientes = await Usuario.findAll({
            where: {
                rol: 'medico',
                estado_aprobacion: 'pendiente'
            }
        });

        const medicosAprobados = await Usuario.findAll({
            where: {
                rol: 'medico',
                estado_aprobacion: 'aprobado'
            }
        });

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

const aprobarMedico = async (req, res) => {
    const { id } = req.params;

    try {
        const medico = await Usuario.findOne({ where: { id, rol: 'medico' } });

        if (medico) {
            medico.estado_aprobacion = 'aprobado';
            await medico.save();

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

const rechazarMedico = async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;

    try {
        const medico = await Usuario.findOne({ where: { id, rol: 'medico' } });

        if (medico) {
            await emailMedicoRechazado({
                email: medico.email,
                nombre: `${medico.nombre} ${medico.apellido}`,
                motivo: motivo || "No se detallaron motivos específicos."
            });

            if (medico.documento_verificacion) {
                const rutaDocumento = path.join(process.cwd(), 'public', 'uploads', 'documentos', medico.documento_verificacion);

                if (fs.existsSync(rutaDocumento)) {
                    fs.unlinkSync(rutaDocumento);
                }
            }

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
    detallePaciente,
    verHistoriaClinica,
    confirmDoctors,
    aprobarMedico,
    rechazarMedico
};