import Sequelize, { DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS ?? "",
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "test" ? false : console.log,
    define: {
      timestamps: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Definición de Modelos
export const Appointment = db.define("Appointment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("PENDING", "COMPLETED", "CANCELLED"),
    defaultValue: "PENDING",
  },
});

export const MedicalHistory = db.define("MedicalHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  consultation_reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  symptoms_anamnesis: {
    type: DataTypes.TEXT,
  },
  diagnosis_code: {
    type: DataTypes.STRING(20),
    defaultValue: "Z00.0",
  },
  diagnosis_description: {
    type: DataTypes.TEXT,
  },
  treatment_plan: {
    type: DataTypes.TEXT,
  },
});

// Relaciones
Appointment.hasOne(MedicalHistory, { foreignKey: "appointment_id" });
MedicalHistory.belongsTo(Appointment, { foreignKey: "appointment_id" });

// Auto-sincronización de tablas al iniciar el servidor
const initDB = async () => {
  try {
    await db.authenticate();
    await db.sync({ alter: true }); // 'alter: true' ajusta o crea las tablas sin borrar los registros existentes
    console.log("✅ Tablas de Citas e Historia Clínica inyectadas y sincronizadas correctamente.");
  } catch (error) {
    console.error("❌ Error al sincronizar Sequelize con PostgreSQL:", error);
  }
};

initDB();

export default db;