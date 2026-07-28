import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import usuariosRouter from "./routes/usuariosRoutes.js";
<<<<<<< HEAD
import medicalRouter from "./routes/medicalRoutes.js";
=======
>>>>>>> PUG_TRANSFER
import db from "./config/db.js";

// Configuración para __dirname en proyectos con ES Modules (import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

<<<<<<< HEAD

app.use(express.static(path.join(__dirname, 'public')));


=======
// 1. Habilitar archivos estáticos (aquí es donde busca la carpeta 'public' para el CSS)
app.use(express.static(path.join(__dirname, 'public')));

// 2. Habilitar Pug
>>>>>>> PUG_TRANSFER
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/", usuariosRouter);
<<<<<<< HEAD
app.use("/", medicalRouter)
=======
>>>>>>> PUG_TRANSFER

const port = 3000;

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
});