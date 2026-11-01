import Usuario from './usuarios.js'; // Verifica si tu archivo es Usuarios.js o usuarios.js
import Cita from './cita.js';       // Usando citas.js según tu estructura

Usuario.hasMany(Cita, { 
  foreignKey: { name: 'paciente_id', allowNull: false },
  as: 'citasPaciente',
  onDelete: 'CASCADE' 
});

Cita.belongsTo(Usuario, { 
  foreignKey: { name: 'paciente_id', allowNull: false },
  as: 'paciente'
});

Usuario.hasMany(Cita, { 
  foreignKey: { name: 'medico_id', allowNull: false },
  as: 'citasMedico',
  onDelete: 'CASCADE' 
});

Cita.belongsTo(Usuario, { 
  foreignKey: { name: 'medico_id', allowNull: false },
  as: 'medico'
});

export {
  Usuario,
  Cita
};