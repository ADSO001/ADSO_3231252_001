import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuariosRouter from "./routes/usuariosRoutes.js";
import medicalRouter from "./routes/medicalRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import db from "./config/db.js";
import Cita from "./models/Cita.js";
import './models/index.js';

import { Op } from "sequelize";

const app = express();
// Habilitar lectura de Forms (Del primero)
app.use(express.urlencoded({extended: true}));

// Habilitar Cookie Parser (Del primero)
app.use(cookieParser());

// Habilitar el CSURF (Del primero)
app.use(csurf({cookie: true}));

// Configuración para __dirname en proyectos con ES Modules (import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




app.use(express.static(path.join(__dirname, 'public')));

try {
  await db.authenticate();
  await db.sync({ alter: true });
  console.log("La conexion es exitosa");
} catch (error) {
  console.error("No se puede conectar", error);
}

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/", usuariosRouter);
app.use("/", medicalRouter)
app.use("/", adminRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
}); 