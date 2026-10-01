import express from 'express';
import protegerRuta from '../middleware/protegerRuta.js';
import rutaAdmin from '../middleware/rutaAdmin.js';
import {
    formularioAdmin,
    managementDoctors,
    formularioAdminAppointment,
    formularioDoctorsHours,
    formulariopatientManagement,
    confirmDoctors,
    aprobarMedico,
    rechazarMedico
} from '../controllers/adminControllers.js';

const router = express.Router();

// Rutas generales de administración
router.get('/adminPanel', protegerRuta, rutaAdmin, formularioAdmin);
router.get('/physicianManagement', protegerRuta, rutaAdmin, managementDoctors);
router.get('/appointmentScheduleAdmin', protegerRuta, rutaAdmin, formularioAdminAppointment);
router.get('/doctorsHours', protegerRuta, rutaAdmin, formularioDoctorsHours);
router.get('/patientManagement', protegerRuta, rutaAdmin, formulariopatientManagement);

// Vista de gestión/aprobación de médicos
router.get('/managementSpecialities', protegerRuta, rutaAdmin, confirmDoctors);

// Acciones para aprobar o rechazar solicitudes (POST)
router.post('/aprobar-medico/:id', protegerRuta, rutaAdmin, aprobarMedico);
router.post('/rechazar-medico/:id', protegerRuta, rutaAdmin, rechazarMedico);

export default router;