import jwt from 'jsonwebtoken';
import Usuario from '../models/usuarios.js';

const rutaMedico = async (req, res, next) => {

    const { _token } = req.cookies;

    if (!_token) {
        return res.redirect('/login');
    }

    try {

        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.findByPk(decoded.id);

        if (!usuario) {
            return res.redirect('/login');
        }

        if (usuario.rol !== 'medico') {
            return res.redirect('/login');
        }


        if (usuario.estado_aprobacion !== 'aprobado') {
            return res.render('mensajes/esperaAprobacion', {
                pagina: 'Cuenta en Revisión',
                mensaje: 'Tu cuenta de médico aún está siendo verificada por el administrador.'
            });
        }

        req.usuario = usuario;
        return next();

    } catch (error) {
        console.error("Error en rutaMedico:", error);
        return res.clearCookie('_token').redirect('/login');
    }
};

export default rutaMedico;