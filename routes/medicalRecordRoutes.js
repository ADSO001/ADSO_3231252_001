import express from 'express';
import { renderCreateMedicalRecord, createMedicalRecord } from '../controllers/medicalRecordController.js';
import protegerRuta from '../middleware/protegerRuta.js';
import rutaMedico from '../middleware/rutaMedico.js';

const router = express.Router();

router.get('/create/:appointmentId', protegerRuta, rutaMedico, renderCreateMedicalRecord);
router.post('/create', protegerRuta, rutaMedico, createMedicalRecord);

export default router;