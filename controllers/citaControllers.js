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

export {
    crearCita
};