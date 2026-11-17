import jwt from "jsonwebtoken";
import Usuario from "../models/usuarios.js";

const COOKIE_OPCIONES = {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
};

const protegerRuta = async (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    const token = req.cookies._token;

    if (!token) {
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ["password", "token"] }
        });

        if (!usuario) {
            return res.clearCookie("_token", COOKIE_OPCIONES).redirect("/login");
        }

        req.usuario = usuario;
        return next();
    } catch (error) {
        console.log("⚠️ Error al verificar el token:", error.message);
        return res.clearCookie("_token", COOKIE_OPCIONES).redirect("/login");
    }
};

export default protegerRuta;