const formularioMedico = (req, res) => {
    res.render("medicalRegistration", {
        tituloPagina: "Formulario de Registro - paciente"
    });
}
export {formularioMedico}