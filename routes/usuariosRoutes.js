import express from "express";
import { check } from "express-validator";
import { 
  formularioLogin, 
  autenticar, 
  verPatientPanel, 
  registrar, 
  confirmar, 
  formularioRegistro, 
  resetPassword, 
  formularioOlvidePassword, 
  comprobarToken, 
  nuevaPassword 
} from "../controllers/usuariosControllers.js";
import protegerRuta from "../middleware/protegerRuta.js"; 

const router = express.Router();

router.get("/login", formularioLogin);
router.post("/login", autenticar);

router.get("/pacientRegistration", formularioRegistro);


router.post("/pacientRegistration", [
  check("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  check("apellido").notEmpty().withMessage("El apellido es obligatorio"),
  check("email").isEmail().withMessage("Ingrese un correo electrónico válido"),
  check("telefono").notEmpty().withMessage("El teléfono es obligatorio"),
  check("fecha_nacimiento").notEmpty().withMessage("La fecha de nacimiento es obligatoria"),
  check("password").isLength({ min: 6 }).withMessage("La contraseña debe ser de al menos 6 caracteres"),
  check("repeat_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  check("genero").notEmpty().withMessage("Seleccione un género"),
  check("tipo_documento").notEmpty().withMessage("Seleccione un tipo de documento"),
  check("numero_documento").notEmpty().withMessage("El número de documento es obligatorio"),
  check("direccion").notEmpty().withMessage("La dirección es obligatoria"),
  check("telefono_emergencia").notEmpty().withMessage("El teléfono de emergencia es obligatorio")
], registrar);

router.get("/confirmar/:token", confirmar);

router.get("/forgotPassword", formularioOlvidePassword);
router.post("/forgotPassword", resetPassword);

router.get("/forgotPassword/:token", comprobarToken);
router.post("/forgotPassword/:token", nuevaPassword);

router.get("/patientPanel", protegerRuta, verPatientPanel);

export default router;