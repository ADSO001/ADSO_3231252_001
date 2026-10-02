
const rutaAdmin = (req, res, next) => {
    // req.usuario fue cargado previamente por el middleware protegerRuta
    if (req.usuario && req.usuario.rol === 'admin') {
        return next();
    }

    // Si no tiene rol de admin, redirigir al login
    return res.redirect('/login');
};

export default rutaAdmin;