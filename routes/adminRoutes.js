import express from 'express';
import { 
    formularioAdmin, 
    managementDoctors, 
    formularioAdminAppointment, 
    formularioDoctorsHours, 
    formulariopatientManagement, 
    detallePaciente,
    verHistoriaClinica,
    confirmDoctors, 
    aprobarMedico, 
    rechazarMedico 
} from '../controllers/adminControllers.js';

import protegerRuta from '../middleware/protegerRuta.js';
import rutaAdmin from '../middleware/rutaAdmin.js';

const router = express.Router();

// Rutas generales de administración

router.get('/adminPanel', protegerRuta, rutaAdmin, formularioAdmin);
router.get('/managementDoctors', protegerRuta, rutaAdmin, managementDoctors);
router.get('/appointmentScheduleAdmin', protegerRuta, rutaAdmin, formularioAdminAppointment);
router.get('/doctorsHours', protegerRuta, rutaAdmin, formularioDoctorsHours);

// Rutas de gestión de pacientes
router.get('/patientManagement', protegerRuta, rutaAdmin, formulariopatientManagement);
router.get('/patientManagement/:id', protegerRuta, rutaAdmin, detallePaciente); // <-- Nueva ruta para ver el expediente
router.get('/historiaClinica/:id', protegerRuta, rutaAdmin, verHistoriaClinica); // <-- Nueva ruta conectada al botón

// Vista de gestión/aprobación de médicos
router.get('/managementSpecialities', protegerRuta, rutaAdmin, confirmDoctors);

// Acciones para aprobar o rechazar solicitudes (POST)
router.post('/aprobar-medico/:id', protegerRuta, rutaAdmin, aprobarMedico);
router.post('/rechazar-medico/:id', protegerRuta, rutaAdmin, rechazarMedico);

export default router;