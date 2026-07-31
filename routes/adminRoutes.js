import express from "express";

import {formularioAdmin, formularioAdminAppointment} from "../controllers/adminControllers.js";

const router = express.Router();


router.get("/adminPanel", formularioAdmin)
router.get("/appointmentScheduleAdmin", formularioAdminAppointment)





export default router;