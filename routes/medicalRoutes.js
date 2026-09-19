import express from 'express';
import upload from '../middleware/subirDocumento.js';
import rutaMedico from '../middleware/rutaMedico.js';
import { 
    formularioMedico, 
    medicalPanel, 
    formularioRegistroMedico, 
    registrarMedico 
} from '../controllers/medicalControllers.js';

const router = express.Router();

// Formulario de registro (GET) - Nota: unificamos o separamos correctamente por método
router.get('/medicalRegistration', formularioRegistroMedico);

// Procesamiento de registro (POST) -> Multer procesa el stream multipart primero
router.post('/medicalRegistration', (req, res, next) => {
    upload.single('documento_verificacion')(req, res, (err) => {
        if (err) {
            // Maneja posibles errores del filtro de Multer (ej. tipo de archivo o peso > 5MB)
            return res.render('medicalRegistration', {
                pagina: 'Registro de Médico - SIGCMI',
                csrfToken: req.csrfToken(),
                errores: [{ msg: err.message }],
                usuario: req.body
            });
        }
        next();
    });
}, registrarMedico);

// Vista adicional del formulario médico si aplica
router.get('/formularioMedico', formularioMedico);

// Panel médico protegido con el middleware rutaMedico
router.get('/medicalPanel', rutaMedico, medicalPanel);

export default router;