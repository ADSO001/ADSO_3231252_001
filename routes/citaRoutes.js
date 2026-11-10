console.log("--- LEYENDO ARCHIVO DE RUTAS DE CITAS ---");
import express from 'express';
import { crearCita, cancelarCita, reprogramarCita, obtenerDecisionCorreo, decidirCitaDesdeCorreo, decidirCitaDesdePanel } from '../controllers/citaControllers.js';
import rutaMedico from '../middleware/rutaMedico.js';
import protegerRuta from '../middleware/protegerRuta.js';

const router = express.Router();

// Los enlaces del correo son de un solo uso y requieren confirmación explícita.
router.get('/citas/responder-correo/:token/:decision', obtenerDecisionCorreo);
router.post('/citas/responder-correo/:token/:decision', decidirCitaDesdeCorreo);
router.post('/medico/citas/:id/estado', protegerRuta, rutaMedico, decidirCitaDesdePanel);


router.post('/citas/crear', protegerRuta, crearCita);


router.post('/citas/:id/cancelar', protegerRuta, cancelarCita);
router.post('/citas/:id/reprogramar', protegerRuta, reprogramarCita);

export default router;