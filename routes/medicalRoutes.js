import express from "express";

import {formularioMedico } from "../controllers/medicalControllers.js";

const router = express.Router();


router.get("/medicalRegistration", formularioMedico)




export default router;