const formularioMedico = (req, res) => {
    res.render("medicalRegistration", {
        tituloPagina: "Formulario de Registro - medico"
    });
}

const medicalPanel = (req, res) => {
    res.render("medicalPanel", {
        tituloPagina: "Panel del Médico"
    });
}

export {formularioMedico, medicalPanel}