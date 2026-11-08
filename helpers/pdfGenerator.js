import PDFDocument from 'pdfkit';

const generarHistoriaClinicaPDF = (historia, paciente, medico, res) => {
  const doc = new PDFDocument({ margin: 45, size: 'A4', bufferPages: true });
  const numeroDocumento = paciente?.numero_documento || 'Paciente';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Historia_Clinica_${numeroDocumento}.pdf`);
  doc.pipe(res);

  const titulo = (texto) => {
    doc.moveDown(0.7).font('Helvetica-Bold').fontSize(12).fillColor('#17365D').text(texto);
    doc.moveDown(0.25).fillColor('#222222');
  };
  const campo = (etiqueta, valor) => {
    const contenido = valor === undefined || valor === null || String(valor).trim() === '' ? 'No registrado' : String(valor);
    doc.font('Helvetica-Bold').fontSize(9).text(`${etiqueta}: `, { continued: true });
    doc.font('Helvetica').fontSize(9).text(contenido, { lineGap: 2 });
  };

  doc.font('Helvetica-Bold').fontSize(16).fillColor('#17365D').text('SIGCMI - HISTORIA CLÍNICA', { align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor('#555555').text('Registro de atención ambulatoria', { align: 'center' });
  doc.moveDown();

  titulo('1. Identificación del paciente');
  campo('Nombre', `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim());
  campo('Documento', `${paciente?.tipo_documento || ''} ${paciente?.numero_documento || ''}`.trim());
  campo('Fecha de nacimiento', paciente?.fecha_nacimiento);
  if (paciente?.fecha_nacimiento) {
    const nacimiento = new Date(`${String(paciente.fecha_nacimiento).slice(0, 10)}T12:00:00`);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) edad -= 1;
    if (edad >= 0) campo('Edad', `${edad} años`);
  }
  campo('Género', paciente?.genero);
  campo('Teléfono', paciente?.telefono);
  campo('Teléfono de emergencia', paciente?.telefono_emergencia);
  campo('Dirección', paciente?.direccion);
  campo('Correo', paciente?.email);

  titulo('2. Datos de la atención');
  campo('Fecha de elaboración', historia.fecha_elaboracion ? new Date(historia.fecha_elaboracion).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '');
  campo('Médico tratante', `Dr. ${medico?.nombre || ''} ${medico?.apellido || ''}`);
  campo('Especialidad', medico?.especialidad);
  campo('Registro profesional', medico?.tarjeta_profesional);
  campo('Motivo de consulta', historia.motivo);

  const datos = historia.datos_clinicos || {};
  const grupos = [
    ['3. Identificación y contexto de la atención', [['finalidadConsulta','Finalidad'],['causaExterna','Causa externa'],['entidadResponsable','EPS / entidad responsable'],['tipoUsuario','Tipo de usuario'],['regimenAfiliacion','Régimen de afiliación'],['sedeAtencion','Sede o lugar de atención'],['modalidadAtencion','Modalidad'],['acompanante','Acompañante o responsable'],['parentescoAcompanante','Parentesco'],['telefonoAcompanante','Teléfono del acompañante']]],
    ['4. Antecedentes', [['antecedentesPersonales','Personales'],['antecedentesFamiliares','Familiares'],['antecedentesQuirurgicos','Quirúrgicos'],['antecedentesFarmacologicos','Farmacológicos'],['alergias','Alergias'],['antecedentesPatologicos','Patológicos'],['habitos','Hábitos'],['antecedentesGinecoObstetricos','Ginecológicos y obstétricos']]],
    ['5. Enfermedad actual', [['enfermedadActual','Descripción'],['fechaInicioSintomas','Fecha de inicio'],['tiempoEvolucion','Tiempo de evolución'],['sintomasAsociados','Síntomas asociados'],['factoresMejoranEmpeoran','Factores que modifican síntomas'],['tratamientosPrevios','Tratamientos previos']]],
    ['6. Revisión por sistemas', [['revisionCardiovascular','Cardiovascular'],['revisionRespiratoria','Respiratorio'],['revisionDigestiva','Digestivo'],['revisionNeurologica','Neurológico'],['revisionMusculoesqueletica','Musculoesquelético'],['revisionGenitourinaria','Genitourinario'],['revisionDermatologica','Dermatológico'],['revisionOtros','Otros']]],
    ['7. Signos vitales y antropometría', [['presionArterial','Presión arterial (mmHg)'],['frecuenciaCardiaca','Frecuencia cardíaca (lpm)'],['frecuenciaRespiratoria','Frecuencia respiratoria (rpm)'],['temperatura','Temperatura (°C)'],['saturacionOxigeno','Saturación de oxígeno (%)'],['peso','Peso (kg)'],['talla','Talla (cm)'],['imc','IMC']]],
    ['8. Examen físico', [['examenEstadoGeneral','Estado general'],['examenCabezaCuello','Cabeza y cuello'],['examenTorax','Tórax'],['examenCardiopulmonar','Cardiopulmonar'],['examenAbdomen','Abdomen'],['examenExtremidades','Extremidades'],['examenNeurologico','Neurológico'],['examenOtros','Otros hallazgos']]],
    ['9. Diagnóstico y análisis', [['diagnosticoPrincipal','Diagnóstico principal'],['codigoCie10','Código CIE-10'],['diagnosticoSecundario','Diagnósticos secundarios'],['analisisMedico','Análisis médico']]],
    ['10. Plan de manejo', [['planTratamiento','Plan de tratamiento'],['medicamentos','Medicamentos'],['examenesSolicitados','Exámenes solicitados'],['procedimientos','Procedimientos'],['recomendaciones','Recomendaciones'],['remisiones','Remisiones'],['incapacidadDias','Días de incapacidad'],['incapacidadMotivo','Motivo de incapacidad'],['fechaControl','Fecha de control'],['observaciones','Observaciones']]]
  ];

  grupos.forEach(([nombre, campos]) => {
    const presentes = campos.filter(([clave]) => datos[clave] !== undefined && datos[clave] !== null && String(datos[clave]).trim() !== '');
    if (!presentes.length) return;
    titulo(nombre);
    presentes.forEach(([clave, etiqueta]) => campo(etiqueta, datos[clave]));
  });

  // Compatibilidad con historias antiguas sin el objeto JSONB.
  if (!Object.keys(datos).length) {
    titulo('3. Descripción y plan registrados previamente');
    campo('Descripción', historia.descripcion);
    campo('Diagnóstico / resolución', historia.resolucion);
  }

  doc.moveDown(1.2);
  doc.font('Helvetica').fontSize(8).fillColor('#666666')
    .text('Documento generado por SIGCMI. La historia clínica debe conservarse bajo las condiciones de confidencialidad y custodia aplicables.', { align: 'justify' });
  doc.end();
};

export default generarHistoriaClinicaPDF;
