import express from "express";

import {formularioLogin, formularioPaciente,formularioContraseña} from "../controllers/usuariosControllers.js";

const router = express.Router();

router.get("/login", formularioLogin)
router.get("/pacientRegistration", formularioPaciente)
router.get("/forgotPassword", formularioContraseña)


    


export default router;