import express from 'express';
import upload from '../middleware/subirDocumento.js';
import rutaMedico from '../middleware/rutaMedico.js';
import uploadMedicalFiles from '../middleware/subirDocumento.js';
import { 
    formularioMedico, 
    medicalPanel, 
    formularioRegistroMedico, 
    registrarMedico,
    guardarHistoriaClinica 
} from '../controllers/medicalControllers.js';

const router = express.Router();

router.get('/medicalRegistration', formularioRegistroMedico);


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


router.get('/formularioMedico', formularioMedico);


router.get('/medicalPanel', rutaMedico, medicalPanel);

router.post('/medico/historia-clinica', rutaMedico, guardarHistoriaClinica);

export default router;