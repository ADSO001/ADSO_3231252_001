
import express from "express";

import {
    agendarCita,
    mostrarPanelMedico
} from "../controllers/citaController.js";

import protegerRuta from "../middleware/protegerRuta.js";

const router = express.Router();

// Mantener compatible la dirección anterior del panel del paciente
router.get("/paciente/panel", protegerRuta, (req, res) => {
    return res.redirect("/patientPanel");
});

// Crear una cita
router.post("/citas/crear", protegerRuta, agendarCita);

// Panel del médico
router.get("/medico/panel", protegerRuta, mostrarPanelMedico);

export default router;
