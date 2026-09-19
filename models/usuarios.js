import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const Usuario = db.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo_documento: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numero_documento: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING,
        defaultValue: 'paciente' // 'paciente', 'medico', 'admin'
    },
    estado_aprobacion: {
        type: DataTypes.STRING,
        defaultValue: 'aprobado' // 'pendiente', 'aprobado', 'rechazado'
    },
    confirmado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    token: {
        type: DataTypes.STRING
    },

    // Campos exclusivos para Médicos (para Pacientes quedan null)
    especialidad: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tarjeta_profesional: {
        type: DataTypes.STRING,
        allowNull: true
    },
    experiencia: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    documento_verificacion: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async function(usuario) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    }
});

// Método personalizado para verificar contraseñas
Usuario.prototype.verificarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

export default Usuario; 