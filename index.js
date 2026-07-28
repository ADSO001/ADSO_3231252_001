import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import usuariosRouter from "./routes/usuariosRoutes.js";
import medicalRouter from "./routes/medicalRoutes.js";
import db from "./config/db.js";

// Configuración para __dirname en proyectos con ES Modules (import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(express.static(path.join(__dirname, 'public')));


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/", usuariosRouter);
app.use("/", medicalRouter)

const port = 3000;

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
});