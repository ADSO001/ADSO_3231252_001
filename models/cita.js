
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Cita = db.define("citas", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
},
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM(
            "pendiente",
            "confirmada",
            "cancelada",
            "completada"
        ),
        allowNull: false,
        defaultValue: "pendiente"
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "usuario_id"
    },
    medicoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "medico_id"
    },
    
}, {
    tableName: "citas",
    timestamps: true
});

export default Cita;
