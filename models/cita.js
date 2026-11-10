import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Cita = db.define('citas', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  especialidad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  token_decision_hash: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  token_decision_expira: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

export default Cita;