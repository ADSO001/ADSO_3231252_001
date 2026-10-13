import Usuario from './Usuarios.js';
import Cita from './cita.js';

Usuario.hasMany(Cita, { 
  foreignKey: { name: 'usuario_id', allowNull: false }, 
  onDelete: 'CASCADE' 
});

Cita.belongsTo(Usuario, { 
  foreignKey: { name: 'usuario_id', allowNull: false } 
});

export {
  Usuario,
  Cita
};