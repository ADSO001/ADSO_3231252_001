import express from "express";

import {formularioLogin, formularioPaciente} from "../controllers/usuariosControllers.js";

const router = express.Router();

router.get("/login", formularioLogin)
router.get("/pacientRegistration", formularioPaciente)





export default router;