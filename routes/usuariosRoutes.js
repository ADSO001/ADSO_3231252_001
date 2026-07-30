    import express from "express";

    import { formularioLogin, autenticar, patientPanel, registrar, confirmar, formularioRegistro, resetPassword, formularioOlvidePassword, comprobarToken, nuevaPassword } from "../controllers/usuariosControllers.js";

    const router = express.Router();

    router.get("/login", formularioLogin)
    router.post("/login", autenticar);

    router.get("/pacientRegistration", formularioRegistro)
    router.post("/pacientRegistration", registrar)

    router.get("/confirmar/:token", confirmar)

    router.get("/forgotPassword", formularioOlvidePassword)
    router.post("/forgotPassword", resetPassword)

    // Validar el Olvide Contraseña
    router.get("/forgotPassword/:token", comprobarToken)
    router.post("/forgotPassword/:token", nuevaPassword)

    router.get("/patientPanel", patientPanel)




    export default router;