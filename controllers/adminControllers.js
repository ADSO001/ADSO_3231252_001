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
const formularioDoctorsHours = (req, res) => {
    res.render("doctorsHours", {
        tituloPagina: "Panel de Administración"
    });
};

const formularioManagementSpecialities = (req, res) => {
    res.render("managementSpecialities", {
        tituloPagina: "Panel de Administración"
    });
};


export {formularioAdmin, formularioAdminAppointment, formularioDoctorsHours, formularioManagementSpecialities }