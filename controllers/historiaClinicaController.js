import { Op } from 'sequelize';
import { Cita, HistoriaClinica, Usuario } from '../models/index.js';

const texto = (valor, max = 12000) => String(valor ?? '').trim().slice(0, max);

const secciones = [
  { titulo: 'Identificación y contexto de la atención', campos: [['finalidadConsulta', 'Finalidad de la consulta'], ['causaExterna', 'Causa externa'], ['entidadResponsable', 'EPS / entidad responsable'], ['tipoUsuario', 'Tipo de usuario'], ['regimenAfiliacion', 'Régimen de afiliación'], ['sedeAtencion', 'Sede o lugar de atención'], ['modalidadAtencion', 'Modalidad de atención'], ['acompanante', 'Nombre del acompañante o responsable'], ['parentescoAcompanante', 'Parentesco'], ['telefonoAcompanante', 'Teléfono del acompañante']] },
  { titulo: 'Antecedentes', campos: [['antecedentesPersonales', 'Antecedentes personales'], ['antecedentesFamiliares', 'Antecedentes familiares'], ['antecedentesQuirurgicos', 'Antecedentes quirúrgicos'], ['antecedentesFarmacologicos', 'Antecedentes farmacológicos'], ['alergias', 'Alergias'], ['antecedentesPatologicos', 'Antecedentes patológicos'], ['habitos', 'Hábitos'], ['antecedentesGinecoObstetricos', 'Antecedentes ginecológicos y obstétricos']] },
  { titulo: 'Enfermedad actual', campos: [['enfermedadActual', 'Descripción de la enfermedad actual'], ['fechaInicioSintomas', 'Fecha de inicio'], ['tiempoEvolucion', 'Tiempo de evolución'], ['sintomasAsociados', 'Síntomas asociados'], ['factoresMejoranEmpeoran', 'Factores que mejoran o empeoran'], ['tratamientosPrevios', 'Tratamientos previos']] },
  { titulo: 'Revisión por sistemas', campos: [['revisionCardiovascular', 'Cardiovascular'], ['revisionRespiratoria', 'Respiratorio'], ['revisionDigestiva', 'Digestivo'], ['revisionNeurologica', 'Neurológico'], ['revisionMusculoesqueletica', 'Musculoesquelético'], ['revisionGenitourinaria', 'Genitourinario'], ['revisionDermatologica', 'Dermatológico'], ['revisionOtros', 'Otros sistemas']] },
  { titulo: 'Signos vitales y antropometría', campos: [['presionArterial', 'Presión arterial (mmHg)'], ['frecuenciaCardiaca', 'Frecuencia cardíaca (lpm)'], ['frecuenciaRespiratoria', 'Frecuencia respiratoria (rpm)'], ['temperatura', 'Temperatura (°C)'], ['saturacionOxigeno', 'Saturación de oxígeno (%)'], ['peso', 'Peso (kg)'], ['talla', 'Talla (cm)'], ['imc', 'Índice de masa corporal']] },
  { titulo: 'Examen físico', campos: [['examenEstadoGeneral', 'Estado general'], ['examenCabezaCuello', 'Cabeza y cuello'], ['examenTorax', 'Tórax'], ['examenCardiopulmonar', 'Cardiopulmonar'], ['examenAbdomen', 'Abdomen'], ['examenExtremidades', 'Extremidades'], ['examenNeurologico', 'Neurológico'], ['examenOtros', 'Otros hallazgos']] },
  { titulo: 'Diagnóstico y análisis', campos: [['diagnosticoSecundario', 'Diagnósticos secundarios'], ['analisisMedico', 'Análisis médico']] },
  { titulo: 'Plan de manejo', campos: [['planTratamiento', 'Plan de tratamiento'], ['medicamentos', 'Medicamentos (nombre, dosis, vía, frecuencia y duración)'], ['examenesSolicitados', 'Exámenes solicitados'], ['procedimientos', 'Procedimientos'], ['recomendaciones', 'Recomendaciones'], ['remisiones', 'Remisiones'], ['incapacidadDias', 'Días de incapacidad'], ['incapacidadMotivo', 'Motivo de incapacidad'], ['fechaControl', 'Fecha de control'], ['observaciones', 'Observaciones']] }
];

export const guardarHistoriaClinica = async (req, res) => {
  let transaccion;
  try {
    transaccion = await HistoriaClinica.sequelize.transaction();
    const citaId = texto(req.body.citaId, 60);
    const motivo = texto(req.body.motivo, 500);
    const codigoCie10 = texto(req.body.codigoCie10, 20).toUpperCase();
    const diagnostico = texto(req.body.diagnosticoPrincipal, 2000);
    const datosEntrada = req.body.datosClinicos;

    if (!citaId || !motivo || !codigoCie10 || !diagnostico || !datosEntrada || typeof datosEntrada !== 'object' || Array.isArray(datosEntrada) || !texto(datosEntrada.planTratamiento)) {
      await transaccion.rollback();
      return res.status(400).json({ error: 'Completa el motivo, el código CIE-10, el diagnóstico y la información clínica.' });
    }

    const cita = await Cita.findOne({
      where: { id: citaId, medico_id: req.usuario.id },
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE
    });
    if (!cita) {
      await transaccion.rollback();
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada.' });
    }

    const existente = await HistoriaClinica.findOne({ where: { cita_uuid: cita.id }, transaction: transaccion });
    if (existente) {
      await transaccion.rollback();
      return res.status(409).json({ error: 'Esta cita ya tiene una historia clínica registrada. Consulta el registro existente.' });
    }

    const datosClinicos = {};
    for (const [clave, valor] of Object.entries(datosEntrada)) {
      if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') {
        datosClinicos[clave] = texto(valor, 12000);
      }
    }
    datosClinicos.diagnosticoPrincipal = diagnostico;
    datosClinicos.codigoCie10 = codigoCie10;

    const descripcion = texto(datosClinicos.enfermedadActual || 'No se registró descripción de enfermedad actual.');
    const resolucion = texto(datosClinicos.planTratamiento || 'Plan de manejo no especificado.');

    await HistoriaClinica.create({
      cita_uuid: cita.id,
      paciente_id: cita.paciente_id,
      medico_id: req.usuario.id,
      motivo,
      descripcion,
      resolucion,
      diagnostico_principal: diagnostico,
      codigo_cie10: codigoCie10,
      datos_clinicos: datosClinicos,
      fecha_elaboracion: new Date()
    }, { transaction: transaccion });

    cita.estado = 'completada';
    await cita.save({ transaction: transaccion });
    await transaccion.commit();

    return res.status(201).json({ mensaje: 'Historia clínica guardada correctamente y cita completada.' });
  } catch (error) {
    if (transaccion && !transaccion.finished) await transaccion.rollback();
    console.error('Error al guardar historia clínica:', error);
    return res.status(500).json({ error: 'No fue posible guardar la historia clínica.' });
  }
};

const puedeConsultarHistoria = async (usuario, historia) => {
  if (usuario.rol === 'admin') return true; // Autorización total para administradores
  if (usuario.rol === 'paciente') return historia.paciente_id === usuario.id;
  if (usuario.rol === 'medico') {
    if (historia.medico_id === usuario.id) return true;
    const relacionClinica = await Cita.findOne({
      where: { medico_id: usuario.id, paciente_id: historia.paciente_id, estado: { [Op.ne]: 'cancelada' } }
    });
    return Boolean(relacionClinica);
  }
  return false;
};

const pacienteFecha = (fecha) => fecha ? String(fecha).slice(0, 10) : null;
const calcularEdad = (fecha) => {
  if (!fecha) return null;
  const nacimiento = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad >= 0 ? edad : null;
};

export const verHistoriaClinica = async (req, res) => {
  try {
    const historia = await HistoriaClinica.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'paciente', attributes: ['id', 'nombre', 'apellido', 'tipo_documento', 'numero_documento', 'genero', 'telefono', 'telefono_emergencia', 'direccion', 'email', 'fecha_nacimiento'] },
        { model: Usuario, as: 'medico', attributes: ['id', 'nombre', 'apellido', 'especialidad', 'tarjeta_profesional'] },
        { model: Cita, as: 'cita', attributes: ['id', 'fecha', 'hora', 'motivo', 'especialidad'] }
      ]
    });
    if (!historia) return res.status(404).send('Historia clínica no encontrada.');
    if (!(await puedeConsultarHistoria(req.usuario, historia))) return res.status(403).send('No tienes autorización para consultar esta historia clínica.');

    const datos = historia.datos_clinicos || {};
    const seccionesConDatos = secciones.map(seccion => ({
      titulo: seccion.titulo,
      campos: seccion.campos
        .map(([clave, etiqueta]) => ({ etiqueta, valor: datos[clave] }))
        .filter(campo => campo.valor !== undefined && campo.valor !== null && String(campo.valor).trim() !== '')
    })).filter(seccion => seccion.campos.length > 0);

    res.render('templates/clinical-history-detail', {
      tituloPagina: 'Historia clínica',
      historia,
      datos,
      secciones: seccionesConDatos,
      paciente: historia.paciente,
      medico: historia.medico,
      rolUsuario: req.usuario.rol,
      edadPaciente: calcularEdad(pacienteFecha(historia.paciente?.fecha_nacimiento))
    });
  } catch (error) {
    console.error('Error al consultar historia clínica:', error);
    res.status(500).send('Error al consultar la historia clínica.');
  }
};

export const descargarHistoriaClinicaPDF = async (req, res) => {
  try {
    const historia = await HistoriaClinica.findByPk(req.params.id);
    if (!historia) return res.status(404).send('Historia clínica no encontrada.');
    if (!(await puedeConsultarHistoria(req.usuario, historia))) return res.status(403).send('No tienes autorización para descargar esta historia clínica.');

    const [paciente, medico] = await Promise.all([
      Usuario.findByPk(historia.paciente_id),
      Usuario.findByPk(historia.medico_id)
    ]);
    const { default: generarPDF } = await import('../helpers/pdfGenerator.js');
    generarPDF(historia, paciente, medico, res);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar el PDF de la historia clínica.');
  }
};