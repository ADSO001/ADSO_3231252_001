import express from 'express';
import upload from '../middleware/subirDocumento.js';
import rutaMedico from '../middleware/rutaMedico.js';
import uploadMedicalFiles from '../middleware/subirDocumento.js';
import { 
    formularioMedico, 
    medicalPanel, 
    formularioRegistroMedico, 
    registrarMedico,
    formularioCrearHistoriaClinica,
    guardarHistoriaClinica
} from '../controllers/medicalControllers.js';

const router = express.Router();

// Formulario de registro (GET)
router.get('/medicalRegistration', formularioRegistroMedico);

// Procesamiento de registro (POST) -> Multer procesa el stream multipart primero
router.post('/medicalRegistration', (req, res, next) => {
    uploadMedicalFiles(req, res, (err) => {
        if (err) {
            const csrfTokenSeguro = typeof req.csrfToken === 'function' ? req.csrfToken() : (req.body && req.body._csrf ? req.body._csrf : '');

            return res.render('medicalRegistration', {
                pagina: 'Registro de Médico - SIGCMI',
                csrfToken: csrfTokenSeguro,
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

// ==========================================
// MÓDULO: HISTORIA CLÍNICA (MÉDICO)
// ==========================================

// Vista para que el médico redacte la historia clínica de una cita
router.get('/historia-clinica/crear/:idCita', rutaMedico, formularioCrearHistoriaClinica);

// Procesar y guardar la historia clínica redactada por el médico
router.post('/historia-clinica/guardar/:idCita', rutaMedico, guardarHistoriaClinica);

export default router;