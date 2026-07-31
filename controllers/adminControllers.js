const formularioAdmin = (req, res) => {
    res.render("adminPanel", {
        tituloPagina: "Panel de Administración"
    });
};
const formularioAdminAppointment = (req, res) => {
    res.render("appointmentScheduleAdmin", {
        tituloPagina: "Panel de Administración"
    });
};

export {formularioAdmin, formularioAdminAppointment}