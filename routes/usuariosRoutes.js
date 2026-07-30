import express from "express";

import {formularioLogin, formularioPaciente,formularioContraseña, patientPanel} from "../controllers/usuariosControllers.js";

const router = express.Router();

router.get("/login", formularioLogin)
router.get("/pacientRegistration", formularioPaciente)
router.get("/forgotPassword", formularioContraseña)
router.get("/patientPanel", patientPanel)


export default router;