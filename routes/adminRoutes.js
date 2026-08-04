import express from "express";

import {formularioAdmin, managementDoctors, formularioAdminAppointment, formularioDoctorsHours, formularioManagementSpecialities,formulariopatientManagement} from "../controllers/adminControllers.js";

const router = express.Router();


router.get("/adminPanel", formularioAdmin)
router.get("/appointmentScheduleAdmin", formularioAdminAppointment)
router.get("/doctorsHours", formularioDoctorsHours)
router.get("/managementSpecialities", formularioManagementSpecialities)
router.get("/patientManagement", formulariopatientManagement)
router.get("/physicianManagement", managementDoctors)




export default router;