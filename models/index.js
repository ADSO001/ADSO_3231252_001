import Usuario from './usuarios.js';
import Cita from './cita.js';
import HistoriaClinica from './historiaClinica.js';

// Relaciones de citas.
Usuario.hasMany(Cita, { foreignKey: 'paciente_id', as: 'citasPaciente' });
Usuario.hasMany(Cita, { foreignKey: 'medico_id', as: 'citasMedico' });
Cita.belongsTo(Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
Cita.belongsTo(Usuario, { foreignKey: 'medico_id', as: 'medico' });

// Historias clínicas: las nuevas se relacionan con el UUID de la cita.
Cita.hasOne(HistoriaClinica, { foreignKey: 'cita_uuid', sourceKey: 'id', as: 'historia' });
HistoriaClinica.belongsTo(Cita, { foreignKey: 'cita_uuid', targetKey: 'id', as: 'cita' });

Usuario.hasMany(HistoriaClinica, { foreignKey: 'paciente_id', as: 'historiasPaciente' });
HistoriaClinica.belongsTo(Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
Usuario.hasMany(HistoriaClinica, { foreignKey: 'medico_id', as: 'historiasMedico' });
HistoriaClinica.belongsTo(Usuario, { foreignKey: 'medico_id', as: 'medico' });

export { Usuario, Cita, HistoriaClinica };
