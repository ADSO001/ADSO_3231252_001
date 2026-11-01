console.log("--- LEYENDO ARCHIVO DE RUTAS DE CITAS ---");
import express from 'express';
import { crearCita } from '../controllers/citaControllers.js';
import protegerRuta from '../middleware/protegerRuta.js';

const router = express.Router();

router.post('/citas/crear', protegerRuta, crearCita);

export default router; // <-- Esta es la línea que solucionará el error