const formularioLogin = (req, res) => {
    res.render("login", {
        autenticado: true,
        tituloPagina: "Inicio de Sesión"
    });
};
const formularioPaciente = (req, res) => {
    res.render("pacientRegistration", {
        tituloPagina: "Formulario de Registro - paciente"
    });
}
export {formularioPaciente, formularioLogin}




