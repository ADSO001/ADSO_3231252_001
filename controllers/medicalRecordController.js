// Renderizar el formulario de historia clínica
exports.showMedicalRecordForm = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Ajusta la consulta según tus modelos/tablas de la BD
        const [rows] = await db.query(
            `SELECT a.id, a.patient_id, p.name, p.lastName, p.documentType, p.documentNumber, p.age
             FROM appointments a
             JOIN patients p ON a.patient_id = p.id
             WHERE a.id = ?`, 
            [appointmentId]
        );

        if (rows.length === 0) {
            return res.status(404).render('error', { message: 'Cita no encontrada' });
        }

        const data = rows[0];

        res.render('createMedicalRecord', {
            pageTitle: 'Elaborar Historia Clínica',
            appointment: { id: data.id },
            patient: {
                id: data.patient_id,
                name: data.name,
                lastName: data.lastName,
                documentType: data.documentType,
                documentNumber: data.documentNumber,
                age: data.age
            }
        });
    } catch (error) {
        console.error('Error al cargar el formulario:', error);
        res.status(500).render('error', { message: 'Error al abrir la historia clínica' });
    }
};

// Guardar la historia clínica
exports.saveMedicalRecord = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.session.user.id; // ID del médico autenticado
        const { patientId, consultationReason, currentIllness, physicalExam, diagnosis, treatment } = req.body;

        // Insertar en la tabla de historias clínicas
        await db.query(
            `INSERT INTO medical_records 
                (patient_id, doctor_id, appointment_id, consultation_reason, current_illness, physical_exam, diagnosis, treatment, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [patientId, doctorId, appointmentId, consultationReason, currentIllness, physicalExam, diagnosis, treatment]
        );

        // Actualizar el estado de la cita
        await db.query(`UPDATE appointments SET status = 'Completed' WHERE id = ?`, [appointmentId]);

        res.redirect('/medical-panel?success=record_saved');
    } catch (error) {
        console.error('Error al guardar historia clínica:', error);
        res.status(500).render('error', { message: 'Error al guardar la historia clínica' });
    }
};