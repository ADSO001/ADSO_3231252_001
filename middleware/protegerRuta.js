import jwt from "jsonwebtoken";
import Usuario from "../models/usuarios.js";

const protegerRuta = async (req, res, next) => {
    const token = req.cookies._token;

    if (!token) {
        console.log("⚠️ No hay token en las cookies");
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const usuario = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'token'] }
        });

        if (!usuario) {
            console.log("⚠️ Usuario no encontrado en la BD con ID:", decoded.id);
            return res.clearCookie("_token").redirect("/login");
        }

        // --- IMPRESIÓN DE DEPURACIÓN EN TERMINAL ---
        console.log("----------------------------------------");
        console.log("🔍 Usuario autenticado:", usuario.email);
        console.log("🔍 Rol detectado:", usuario.rol);
        console.log("----------------------------------------");

        req.usuario = usuario;
        return next();

    } catch (error) {
        console.log("⚠️ Error al verificar el token:", error.message);
        return res.clearCookie("_token").redirect("/login");
    }
};

export default protegerRuta;