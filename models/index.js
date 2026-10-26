
import Usuario from "./usuarios.js";
import Cita from "./cita.js";

Usuario.hasMany(Cita, {
    as: "citasPaciente",
    foreignKey: {
        name: "usuarioId",
        field: "usuario_id"
    },
    onDelete: "CASCADE"
});

Cita.belongsTo(Usuario, {
    as: "paciente",
    foreignKey: {
        name: "usuarioId",
        field: "usuario_id"
    }
});

Usuario.hasMany(Cita, {
    as: "citasMedico",
    foreignKey: {
        name: "medicoId",
        field: "medico_id"
    },
    onDelete: "CASCADE"
});

Cita.belongsTo(Usuario, {
    as: "medico",
    foreignKey: {
        name: "medicoId",
        field: "medico_id"
    }
});

export { Usuario, Cita };
