
import { Cita, Usuario } from "../models/index.js";

// Crear una cita desde el panel del paciente
const agendarCita = async (req, res) => {
    try {
        const { medicoId, fecha, hora, motivo } = req.body;
        const pacienteId = req.usuario.id;

        // Validar los campos
        if (!medicoId || !fecha || !hora || !motivo?.trim()) {
            return res.redirect("/patientPanel?error=campos");
        }

        // Comprobar que el médico exista y tenga el rol correcto
        const medico = await Usuario.findOne({
            where: {
                id: medicoId,
                rol: "medico"
            }
        });

        if (!medico) {
            console.error("El médico seleccionado no existe:", medicoId);
            return res.redirect("/patientPanel?error=medico");
        }

        // Guardar la cita vinculando al paciente y al médico
        await Cita.create({
            fecha,
            hora,
            motivo: motivo.trim(),
            estado: "Pendiente",
            usuarioId: pacienteId,
            medicoId: medico.id
        });

        console.log(
            `Cita creada: paciente ${pacienteId}, médico ${medico.id}, fecha ${fecha}`
        );

        // Volver al panel original con las citas actualizadas
        return res.redirect("/patientPanel?cita=creada");

    } catch (error) {
        console.error("Error al crear la cita:", error);
        return res.redirect("/patientPanel?error=guardar");
    }
};


// Consultar las citas del paciente y los médicos disponibles
const mostrarPanelPaciente = async (req, res) => {
    try {
        const pacienteId = req.usuario.id;

        const [citas, medicos] = await Promise.all([
            Cita.findAll({
                where: {
                    usuarioId: pacienteId
                },
                include: [
                    {
                        model: Usuario,
                        as: "medico",
                        attributes: ["id", "nombre", "apellido", "email"]
                    }
                ],
                order: [
                    ["fecha", "ASC"],
                    ["hora", "ASC"]
                ]
            }),

            Usuario.findAll({
                where: {
                    rol: "medico",
                    estado_aprobacion: "aprobado"
                },
                attributes: [
                    "id",
                    "nombre",
                    "apellido",
                    "especialidad"
                ],
                order: [["nombre", "ASC"]]
            })
        ]);

        return res.render("patientPanel", {
            tituloPagina: "Panel del Paciente",
            pagina: "Mi Panel - Mis Citas",
            usuario: req.usuario,
            citas,
            medicos,
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error("Error al cargar las citas del paciente:", error);

        return res.status(500).send(
            "No fue posible cargar el panel del paciente. Revisa la terminal del servidor."
        );
    }
};


// Consultar las citas asignadas al médico autenticado
const mostrarPanelMedico = async (req, res) => {
    try {
        const medicoId = req.usuario.id;

        const citas = await Cita.findAll({
            where: {
                medicoId
            },
            include: [
                {
                    model: Usuario,
                    as: "paciente",
                    attributes: ["id", "nombre", "apellido", "email"]
                }
            ],
            order: [
                ["fecha", "ASC"],
                ["hora", "ASC"]
            ]
        });

        return res.render("medicalPanel", {
            tituloPagina: "Panel del Médico",
            pagina: "Panel Médico - Citas Asignadas",
            usuario: req.usuario,
            medico: req.usuario,
            citas
        });

    } catch (error) {
        console.error("Error al cargar las citas del médico:", error);

        return res.status(500).send(
            "No fue posible cargar el panel del médico. Revisa la terminal del servidor."
        );
    }
};


export {
    agendarCita,
    mostrarPanelPaciente,
    mostrarPanelMedico
};
