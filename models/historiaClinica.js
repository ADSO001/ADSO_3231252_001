import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const HistoriaClinica = db.define('historias_clinicas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    resolucion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_elaboracion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

export default HistoriaClinica;