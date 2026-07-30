import express from "express";

import {formularioMedico, medicalPanel} from "../controllers/medicalControllers.js";

const router = express.Router();


router.get("/medicalRegistration", formularioMedico)
router.get("/medicalPanel", medicalPanel)




export default router;