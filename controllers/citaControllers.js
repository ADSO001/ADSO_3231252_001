import { Cita, Usuario } from '../models/index.js';
import { randomBytes, createHash } from 'node:crypto';
import { Op } from 'sequelize';
import { emailNuevaSolicitudCita, emailEstadoCitaPaciente } from '../helpers/emails.js';

const crearCita = async (req, res) => {
    try {
        const { medico_id, fecha, hora, motivo } = req.body;
        const paciente_id = req.usuario.id;

        const [medico, paciente] = await Promise.all([
            Usuario.findOne({ where: { id: medico_id, rol: 'medico', estado_aprobacion: 'aprobado' } }),
            Usuario.findByPk(paciente_id)
        ]);

        if (!medico || !paciente || !fecha || !hora || !motivo || !String(motivo).trim()) {
            return res.redirect('/patientPanel');
        }

        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const cita = await Cita.create({
            paciente_id,
            medico_id,
            fecha,
            hora,
            motivo: String(motivo).trim(),
            especialidad: medico.especialidad || 'General',
            estado: 'pendiente',
            token_decision_hash: tokenHash,
            token_decision_expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        try {
            await emailNuevaSolicitudCita({ medico, paciente, cita, token });
        } catch (emailError) {
            // La solicitud se conserva aunque el servidor de correo esté temporalmente fuera de servicio.
            console.error('No se pudo enviar el correo de nueva solicitud:', emailError.message);
        }

        return res.redirect('/patientPanel');
    } catch (error) {
        console.error('Error detallado al crear la cita:', error);
        return res.redirect('/patientPanel');
    }
};

const obtenerDecisionCorreo = async (req, res) => {
    const { token, decision } = req.params;
    if (!['confirmada', 'cancelada'].includes(decision)) {
        return res.status(400).render('appointmentDecision', { error: 'La opción seleccionada no es válida.' });
    }

    try {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const cita = await Cita.findOne({
            where: {
                token_decision_hash: tokenHash,
                token_decision_expira: { [Op.gt]: new Date() },
                estado: 'pendiente'
            },
            include: [{ model: Usuario, as: 'medico', attributes: ['nombre', 'apellido', 'especialidad', 'tarjeta_profesional'] }, { model: Usuario, as: 'paciente', attributes: ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'fecha_nacimiento', 'telefono', 'telefono_emergencia', 'email'] }]
        });

        if (!cita) {
            return res.status(410).render('appointmentDecision', { error: 'Este enlace ya fue utilizado, venció o la solicitud ya fue atendida.' });
        }

        return res.render('appointmentDecision', {
            cita,
            token,
            decision,
            csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : ''
        });
    } catch (error) {
        console.error('Error al abrir decisión por correo:', error);
        return res.status(500).render('appointmentDecision', { error: 'No fue posible consultar la solicitud. Inténtalo nuevamente.' });
    }
};

const decidirCitaDesdeCorreo = async (req, res) => {
    const { token, decision } = req.params;
    if (!['confirmada', 'cancelada'].includes(decision)) {
        return res.status(400).render('appointmentDecision', { error: 'La opción seleccionada no es válida.' });
    }

    try {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const cita = await Cita.findOne({
            where: {
                token_decision_hash: tokenHash,
                token_decision_expira: { [Op.gt]: new Date() },
                estado: 'pendiente'
            },
            include: [{ model: Usuario, as: 'medico' }, { model: Usuario, as: 'paciente' }]
        });

        if (!cita) {
            return res.status(410).render('appointmentDecision', { error: 'Esta solicitud ya fue atendida o el enlace venció.' });
        }

        const [actualizadas] = await Cita.update({
            estado: decision,
            token_decision_hash: null,
            token_decision_expira: null
        }, {
            where: { id: cita.id, estado: 'pendiente', token_decision_hash: tokenHash, token_decision_expira: { [Op.gt]: new Date() } }
        });

        if (!actualizadas) {
            return res.status(409).render('appointmentDecision', { error: 'Otro usuario ya respondió esta solicitud. No se realizaron cambios adicionales.' });
        }

        try {
            await emailEstadoCitaPaciente({ paciente: cita.paciente, medico: cita.medico, cita, estado: decision });
        } catch (emailError) {
            console.error('No se pudo enviar el correo de respuesta al paciente:', emailError.message);
        }

        return res.render('appointmentDecision', {
            resultado: decision === 'confirmada' ? 'La cita fue confirmada correctamente.' : 'La solicitud fue rechazada y la cita quedó cancelada.'
        });
    } catch (error) {
        console.error('Error al responder solicitud desde correo:', error);
        return res.status(500).render('appointmentDecision', { error: 'Ocurrió un error al procesar la decisión.' });
    }
};

const decidirCitaDesdePanel = async (req, res) => {
    const { id } = req.params;
    const { decision } = req.body;
    const medicoId = req.usuario.id;

    const responderJson = req.accepts(['json', 'html']) === 'json';
    if (req.usuario.rol !== 'medico' || !['confirmada', 'cancelada'].includes(decision)) {
        return responderJson ? res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' }) : res.status(403).redirect('/medicalPanel');
    }

    try {
        const cita = await Cita.findOne({
            where: { id, medico_id: medicoId, estado: 'pendiente' },
            include: [{ model: Usuario, as: 'medico' }, { model: Usuario, as: 'paciente' }]
        });

        if (!cita) return responderJson ? res.status(404).json({ error: 'La solicitud ya no está pendiente o no existe.' }) : res.redirect('/medicalPanel');

        const [actualizadas] = await Cita.update({
            estado: decision,
            token_decision_hash: null,
            token_decision_expira: null
        }, { where: { id, medico_id: medicoId, estado: 'pendiente' } });

        if (!actualizadas) return responderJson ? res.status(409).json({ error: 'La solicitud ya fue atendida.' }) : res.redirect('/medicalPanel');

        try {
            await emailEstadoCitaPaciente({ paciente: cita.paciente, medico: cita.medico, cita, estado: decision });
        } catch (emailError) {
            console.error('No se pudo enviar el correo de respuesta al paciente:', emailError.message);
        }

        return responderJson ? res.json({ mensaje: decision === 'confirmada' ? 'Cita confirmada correctamente.' : 'Solicitud rechazada correctamente.' }) : res.redirect('/medicalPanel');
    } catch (error) {
        console.error('Error al decidir cita desde el panel:', error);
        return responderJson ? res.status(500).json({ error: 'Ocurrió un error al actualizar la cita.' }) : res.redirect('/medicalPanel');
    }
};

const cancelarCita = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol; // 'paciente' o 'medico'

    try {
        const cita = await Cita.findByPk(id);
        
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // Verificamos que quien cancela sea el paciente o el médico de ESA cita
        if (rol === 'paciente' && cita.paciente_id !== usuarioId) return res.status(403).json({ error: 'No autorizado' });
        if (rol === 'medico' && cita.medico_id !== usuarioId) return res.status(403).json({ error: 'No autorizado' });

        cita.estado = 'cancelada';
        await cita.save();

        return res.json({ mensaje: 'Cita cancelada correctamente' });
    } catch (error) {
        console.error("Error al cancelar:", error);
        return res.status(500).json({ error: 'Error al cancelar la cita' });
    }
};

// 2. Función para Reprogramar Cita
const reprogramarCita = async (req, res) => {
    const { id } = req.params;
    const { nuevaFecha, nuevaHora } = req.body;
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol;

    try {
        const cita = await Cita.findByPk(id);
        
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // Verificamos permisos
        if (rol === 'paciente' && cita.paciente_id !== usuarioId) return res.status(403).json({ error: 'No autorizado' });
        if (rol === 'medico' && cita.medico_id !== usuarioId) return res.status(403).json({ error: 'No autorizado' });

        cita.fecha = nuevaFecha;
        cita.hora = nuevaHora;
        await cita.save();

        return res.json({ mensaje: 'Cita reprogramada con éxito' });
    } catch (error) {
        console.error("Error al reprogramar:", error);
        return res.status(500).json({ error: 'Error al reprogramar la cita' });
    }
};

export {
    // Asegúrate de exportarlas todas:
    crearCita,
    cancelarCita,
    reprogramarCita,
    obtenerDecisionCorreo,
    decidirCitaDesdeCorreo,
    decidirCitaDesdePanel
};