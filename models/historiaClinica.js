import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const HistoriaClinica = db.define('historias_clinicas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // Las historias antiguas pueden conservar una columna cita_id en PostgreSQL,
  // pero no se mapea aquí porque su tipo histórico puede variar entre instalaciones.
  // Las nuevas relaciones se realizan exclusivamente mediante cita_uuid (UUID).
  cita_uuid: {
    type: DataTypes.UUID,
    allowNull: true
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(500),
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
  diagnostico_principal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  codigo_cie10: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Los campos clínicos variables se almacenan como JSONB en PostgreSQL.
  datos_clinicos: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  fecha_elaboracion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

export default HistoriaClinica;
