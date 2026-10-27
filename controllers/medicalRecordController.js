import db from '../config/db.js';

const createMedicalRecord = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            appointment_id,
            consultation_reason,
            symptoms_anamnesis,
            diagnosis_code,
            diagnosis_description,
            treatment_plan
        } = req.body;

        const doctor_id = req.usuario ? req.usuario.id : (req.user ? req.user.id : null);

        if (!appointment_id || !consultation_reason) {
            return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
        }

        // Obtener el patient_id de la cita
        const [[cita]] = await connection.query(
            `SELECT patient_id FROM appointments WHERE id = ?`,
            [appointment_id]
        );

        if (!cita) {
            return res.status(404).json({ success: false, message: 'La cita no existe.' });
        }

        await connection.beginTransaction();

        // 1. Insertar la historia clínica
        await connection.execute(
            `INSERT INTO medical_histories 
            (appointment_id, patient_id, doctor_id, consultation_reason, symptoms_anamnesis, diagnosis_code, diagnosis_description, treatment_plan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                appointment_id,
                cita.patient_id,
                doctor_id,
                consultation_reason,
                symptoms_anamnesis || '',
                diagnosis_code || 'Z00.0',
                diagnosis_description || '',
                treatment_plan || ''
            ]
        );

        // 2. Marcar la cita como COMPLETADA para que pase al historial
        await connection.execute(
            `UPDATE appointments SET status = 'COMPLETED' WHERE id = ?`,
            [appointment_id]
        );

        await connection.commit();

        return res.status(200).json({ success: true, message: 'Historia clínica registrada exitosamente.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al guardar historia clínica:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor al guardar.' });
    } finally {
        connection.release();
    }
};

export { createMedicalRecord };