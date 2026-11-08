import express from 'express';
import protegerRuta from '../middleware/protegerRuta.js';
import rutaMedico from '../middleware/rutaMedico.js';
import { guardarHistoriaClinica, verHistoriaClinica, descargarHistoriaClinicaPDF } from '../controllers/historiaClinicaController.js';

const router = express.Router();

router.post('/medico/historia-clinica', protegerRuta, rutaMedico, guardarHistoriaClinica);
router.get('/historia-clinica/:id', protegerRuta, verHistoriaClinica);
router.get('/historia-clinica/pdf/:id', protegerRuta, descargarHistoriaClinicaPDF);

export default router;
