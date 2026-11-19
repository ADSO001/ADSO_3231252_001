import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuariosRouter from "./routes/usuariosRoutes.js";
import medicalRouter from "./routes/medicalRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import citaRouter from "./routes/citaRoutes.js";
import historiaClinicaRouter from "./routes/historiaClinicaRoutes.js";

const app = express();

// Configuración de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Habilitar lectura de formularios estándar
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Habilitar Cookie Parser
app.use(cookieParser());

// 3. CSURF Middleware con excepción para multipart/form-data
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return next();
  }
  csurf({ cookie: true })(req, res, next);
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Motor de plantillas
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/", usuariosRouter);
app.use("/", medicalRouter);
app.use("/", adminRouter);
app.use("/", citaRouter);
app.use("/", historiaClinicaRouter);

// Inyectar sesionSync.js automáticamente en todas las vistas renderizadas
app.use((req, res, next) => {
  const renderOriginal = res.render.bind(res);

  res.render = (vista, opciones, callback) => {
    if (typeof opciones === "function") {
      callback = opciones;
      opciones = {};
    }

    renderOriginal(vista, opciones, (err, html) => {
      if (err) {
        if (callback) return callback(err);
        return next(err);
      }

      const autenticado = Boolean(req.usuario);
      const scriptTag = `<script src="/js/sesionSync.js" data-autenticado="${autenticado}"></script>`;

      const htmlFinal = typeof html === "string" && html.includes("</body>")
        ? html.replace("</body>", `  ${scriptTag}\n</body>`)
        : `${html}\n${scriptTag}`;

      if (callback) return callback(null, htmlFinal);
      res.send(htmlFinal);
    });
  };

  next();
});
export default app;