import app from "./app.js";
import db from "./config/db.js";
import Cita from "./models/Cita.js";
import './models/index.js';

const port = process.env.PORT || 3000;

// Solo se autentica, sincroniza y levanta el puerto si NO estamos ejecutando los tests
if (process.env.NODE_ENV !== 'test') {
  try {
    await db.authenticate();
    await db.sync({ alter: true });
    console.log("La conexión a la BD es exitosa");

    app.listen(port, () => {
      console.log(`Servidor funcionando en el puerto ${port}`);
    });
  } catch (error) {
    console.error("No se puede conectar", error);
  }
}

export default app;