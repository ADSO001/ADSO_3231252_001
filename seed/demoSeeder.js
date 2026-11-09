
import { fakerES } from '@faker-js/faker';
import Usuario from '../models/usuarios.js';
import db from '../config/db.js';

const PASSWORD_DEMO = 'Demo1234!';

const ESPECIALIDADES = [
  'Medicina general',
  'Pediatría',
  'Dermatología',
  'Cardiología',
  'Ginecología',
  'Oftalmología'
];

const correosGenerados = new Set();

const leerCantidad = (nombre, valorPredeterminado) => {
  const argumento = process.argv.find((item) =>
    item.startsWith(`--${nombre}=`)
  );

  if (!argumento) return valorPredeterminado;

  const cantidad = Number(argumento.split('=')[1]);

  if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > 100) {
    throw new Error(
      `El valor de --${nombre} debe ser un entero entre 0 y 100.`
    );
  }

  return cantidad;
};

// Limpiar nombres para utilizarlos en los correos
const limpiarTexto = (valor) => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

// Generar correos cortos y comprobar que no estén repetidos
const generarCorreo = async (rol, nombre, apellido, transaccion) => {
  const prefijo = rol === 'medico' ? 'm' : 'p';

  const inicial = limpiarTexto(nombre).charAt(0) || 'u';
  const apellidoCorto = limpiarTexto(apellido).slice(0, 12) || 'usuario';

  for (let intento = 0; intento < 50; intento++) {
    const numero = fakerES.string.numeric(5);

    const correo =
      `${prefijo}.${inicial}${apellidoCorto}.${numero}@example.test`;

    // Evitar duplicados dentro del mismo proceso
    if (correosGenerados.has(correo)) {
      continue;
    }

    // Comprobar si el correo ya existe en PostgreSQL
    const existente = await Usuario.findOne({
      where: { email: correo },
      attributes: ['id'],
      transaction: transaccion
    });

    if (!existente) {
      correosGenerados.add(correo);
      return correo;
    }
  }

  throw new Error('No fue posible generar un correo electrónico único.');
};

// Crear información personal
const crearDatosPersonales = async (rol, indice, sello, transaccion) => {
  const nombre = fakerES.person.firstName();
  const apellido = fakerES.person.lastName();

  const identificador =
    `${rol.toUpperCase()}-${sello}-${String(indice).padStart(3, '0')}`;

  const correo = await generarCorreo(
    rol,
    nombre,
    apellido,
    transaccion
  );

  return {
    nombre,
    apellido,
    tipo_documento: 'OTRO',
    numero_documento: `DEMO-${identificador}`,
    genero: fakerES.helpers.arrayElement([
      'Femenino',
      'Masculino',
      'Otro'
    ]),
    telefono: `000000${String(indice).padStart(4, '0')}`,
    direccion: `Dirección ficticia ${indice}, Pereira, Risaralda`,
    fecha_nacimiento: fakerES.date.birthdate({
      min: 18,
      max: 80,
      mode: 'age'
    }),
    telefono_emergencia: `000001${String(indice).padStart(4, '0')}`,
    email: correo,
    password: PASSWORD_DEMO,
    rol,
    estado_aprobacion: 'aprobado',
    confirmado: true
  };
};

// Crear información del médico
const crearMedicoDemo = async (indice, sello, transaccion) => ({
  ...await crearDatosPersonales(
    'medico',
    indice,
    sello,
    transaccion
  ),

  especialidad: fakerES.helpers.arrayElement(ESPECIALIDADES),
  tarjeta_profesional: `DEMO-RM-${sello}-${String(indice).padStart(3, '0')}`,
  experiencia: fakerES.number.int({ min: 1, max: 25 }),
  documento_verificacion: null,
  foto: null,
  horarios: 'Lunes a viernes, 8:00 a. m. - 5:00 p. m.',
  precio_consulta: fakerES.number.int({
    min: 50000,
    max: 180000
  })
});

// Proceso principal
async function importarUsuariosDemo() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'No se permite crear usuarios ficticios en producción.'
    );
  }

  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error(
      'Para confirmar la creación de datos ficticios, define ALLOW_DEMO_SEED=true y vuelve a ejecutar el comando.'
    );
  }

  let transaccion;

  try {
    const cantidadMedicos = leerCantidad('medicos', 3);
    const cantidadPacientes = leerCantidad('pacientes', 12);

    const sello = new Date()
      .toISOString()
      .replace(/\D/g, '')
      .slice(0, 14);

    await db.authenticate();

    transaccion = await db.transaction();

    const cuentasCreadas = [];

    // Crear médicos
    for (let indice = 1; indice <= cantidadMedicos; indice++) {
      const datosMedico = await crearMedicoDemo(
        indice,
        sello,
        transaccion
      );

      const medico = await Usuario.create(datosMedico, {
        transaction: transaccion
      });

      cuentasCreadas.push({
        rol: 'Médico',
        email: medico.email
      });
    }

    // Crear pacientes
    for (let indice = 1; indice <= cantidadPacientes; indice++) {
      const datosPaciente = await crearDatosPersonales(
        'paciente',
        indice,
        sello,
        transaccion
      );

      const paciente = await Usuario.create(datosPaciente, {
        transaction: transaccion
      });

      cuentasCreadas.push({
        rol: 'Paciente',
        email: paciente.email
      });
    }

    await transaccion.commit();

    console.log('\nUsuarios ficticios creados correctamente.');
    console.log(`Médicos de prueba: ${cantidadMedicos}`);
    console.log(`Pacientes de prueba: ${cantidadPacientes}`);
    console.log(`Contraseña común: ${PASSWORD_DEMO}`);

    console.log('\nCuentas creadas:');

    for (const cuenta of cuentasCreadas) {
      console.log(`- ${cuenta.rol}: ${cuenta.email}`);
    }

    console.log('\nCorreos terminados en @example.test.');
    console.log('Documentos y teléfonos con valores ficticios.');
    console.log('No se crearon historias clínicas ni diagnósticos de prueba.\n');

  } catch (error) {
    if (transaccion && !transaccion.finished) {
      await transaccion.rollback().catch(() => {});
    }

    console.error(
      'No fue posible crear los usuarios ficticios:',
      error.message
    );

    process.exitCode = 1;

  } finally {
    correosGenerados.clear();
    await db.close().catch(() => {});
  }
}

importarUsuariosDemo();
