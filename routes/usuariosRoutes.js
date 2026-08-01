
import express from "express";
import { formularioLogin, autenticar, verPatientPanel, registrar, confirmar, formularioRegistro, resetPassword, formularioOlvidePassword, comprobarToken, nuevaPassword } from "../controllers/usuariosControllers.js";
import protegerRuta from "../middleware/protegerRuta.js"; 

const router = express.Router();

router.get("/login", formularioLogin)
router.post("/login", autenticar);

router.get("/pacientRegistration", formularioRegistro)
router.post("/pacientRegistration", registrar)

router.get("/confirmar/:token", confirmar)

router.get("/forgotPassword", formularioOlvidePassword)
router.post("/forgotPassword", resetPassword)


router.get("/forgotPassword/:token", comprobarToken)
router.post("/forgotPassword/:token", nuevaPassword)


router.get("/patientPanel", protegerRuta, verPatientPanel);

export default router;