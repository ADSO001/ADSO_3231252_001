import { Cita } from '../models/index.js';

const crearCita = async (req, res) => {
    try {
        const { medico_id, especialidad, fecha, hora, motivo } = req.body;
        const paciente_id = req.usuario.id;

        await Cita.create({
            paciente_id,
            medico_id,
            fecha,
            hora,
            motivo,
            especialidad,
            estado: 'pendiente'
        });

        res.redirect('/patientPanel');
    } catch (error) {
        console.error(error);
        res.redirect('/patientPanel');
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
    reprogramarCita
};