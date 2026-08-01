import express from "express";

import {formularioAdmin, formularioAdminAppointment, formularioDoctorsHours, formularioManagementSpecialities,formulariopatientManagement} from "../controllers/adminControllers.js";

const router = express.Router();


router.get("/adminPanel", formularioAdmin)
router.get("/appointmentScheduleAdmin", formularioAdminAppointment)
router.get("/doctorsHours", formularioDoctorsHours)
router.get("/managementSpecialities", formularioManagementSpecialities)
router.get("/patientManagement", formulariopatientManagement)





export default router;