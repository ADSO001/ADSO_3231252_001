
import app from "./app.js";
import db from "./config/db.js";
import "./models/index.js";

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
    try {
        await db.authenticate();
        console.log("Conexión con PostgreSQL exitosa");

        await db.sync();
        console.log("Modelos sincronizados correctamente");

        app.listen(port, () => {
            console.log(`Servidor funcionando en el puerto ${port}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
    }
}

export default app;
