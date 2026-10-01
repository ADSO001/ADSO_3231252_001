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

const app = express();

// 1. Habilitar lectura de formularios estándar
app.use(express.urlencoded({ extended: true }));

// 2. Habilitar Cookie Parser
app.use(cookieParser());

// 3. CSURF Middleware con excepción para multipart/form-data
// Evita que csurf rompa peticiones POST multipart antes de que Multer las procese
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return next(); // Pasa directo a las rutas donde Multer procesará el archivo
  }
  csurf({ cookie: true })(req, res, next);
});

// Configuración de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

try {
  await db.authenticate();
  await db.sync({ alter: true });
  console.log("La conexión a la BD es exitosa");
} catch (error) {
  console.error("No se puede conectar", error);
}

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/", usuariosRouter);
app.use("/", medicalRouter);
app.use("/", adminRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
});

export default app;