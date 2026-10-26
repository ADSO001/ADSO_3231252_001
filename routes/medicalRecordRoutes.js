const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middleware/authMiddleware'); // Ajusta según tu middleware

router.get('/create/:appointmentId', authMiddleware, medicalRecordController.showMedicalRecordForm);
router.post('/save/:appointmentId', authMiddleware, medicalRecordController.saveMedicalRecord);

module.exports = router;