console.log("--- LEYENDO ARCHIVO DE RUTAS DE CITAS ---");
import express from 'express';
import { crearCita, cancelarCita, reprogramarCita } from '../controllers/citaControllers.js';
import protegerRuta from '../middleware/protegerRuta.js';

const router = express.Router();


router.post('/citas/crear', protegerRuta, crearCita);


router.post('/citas/:id/cancelar', protegerRuta, cancelarCita);
router.post('/citas/:id/reprogramar', protegerRuta, reprogramarCita);

export default router;