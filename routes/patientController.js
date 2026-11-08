const { ClinicalHistory, Appointment, User } = require('../models');

exports.viewPatientHistory = async (req, res) => {
  try {
    const patientId = req.session.user.id;

    const histories = await ClinicalHistory.findAll({
      where: { patientId },
      include: [
        { model: Appointment },
        { model: User, as: 'Doctor', attributes: ['name', 'lastName'] }
      ],
      order: [['attentionDate', 'DESC']]
    });

    res.render('patient/history', { histories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el historial clínico');
  }
};