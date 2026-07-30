import express from "express";

import {formularioAdmin} from "../controllers/adminControllers.js";

const router = express.Router();


router.get("/adminPanel", formularioAdmin)





export default router;