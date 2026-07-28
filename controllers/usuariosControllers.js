const formularioLogin = (req, res) => {
    res.render("login", {
        autenticado: true,
        tituloPagina: "Inicio de Sesión"
    });
};

export {formularioLogin}

