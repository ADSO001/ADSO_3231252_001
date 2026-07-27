import express from "express";

import {formularioLogin } from "../controllers/usuariosControllers.js";

const router = express.Router();

router.get("/login", formularioLogin)




export default router;