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
const formularioContraseña = (req, res) => {
    res.render("forgotPassword", {
        tituloPagina: "Formulario de Recuperar Contraseña "
    });
}

const patientPanel = (req, res) => {
    res.render("patientPanel", {
        tituloPagina: "Panel del Paciente"
    });
}

export {formularioPaciente, formularioLogin, formularioContraseña, patientPanel}




