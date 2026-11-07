import { check, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { Usuario, Cita, HistoriaClinica } from '../models/index.js';

const obtenerCsrfToken = (req) => {
    return typeof req.csrfToken === 'function' ? req.csrfToken() : req.body._csrf;
};

const formularioRegistroMedico = (req, res) => {
    res.render('medicalRegistration', {
        pagina: 'Registro de Médico - SIGCMI',
        csrfToken: obtenerCsrfToken(req),
        errores: [],
        usuario: {}
    });
};

const registrarMedico = async (req, res) => {
    console.log("BODY RECIBIDO:", req.body);
    console.log("ARCHIVOS RECIBIDOS:", req.files);

    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('apellido').notEmpty().withMessage('El apellido es obligatorio').run(req);
    await check('tipo_documento').notEmpty().withMessage('Selecciona el tipo de documento').run(req);
    await check('numero_documento').notEmpty().withMessage('El número de documento es obligatorio').run(req);
    await check('genero').notEmpty().withMessage('Selecciona tu género').run(req);
    await check('telefono').notEmpty().withMessage('El teléfono es obligatorio').run(req);
    await check('direccion').notEmpty().withMessage('La dirección es obligatoria').run(req);
    await check('email').isEmail().withMessage('Ingresa un correo electrónico válido').run(req);
    await check('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no coinciden').run(req);
    await check('especialidad').notEmpty().withMessage('Selecciona tu especialidad').run(req);
    await check('tarjeta_profesional').notEmpty().withMessage('La tarjeta profesional es obligatoria').run(req);
    await check('experiencia').isInt({ min: 0 }).withMessage('Ingresa un número válido de años de experiencia').run(req);
    await check('precio_consulta').notEmpty().withMessage('El valor por consulta es obligatorio').run(req);
    await check('horarios').notEmpty().withMessage('Los horarios de atención son obligatorios').run(req);

    let resultado = validationResult(req);

    const eliminarArchivosSiExisten = () => {
        if (req.files) {
            if (req.files['documento_verificacion']) {
                const rutaDoc = path.join(process.cwd(), 'public/uploads/documentos', req.files['documento_verificacion'][0].filename);
                if (fs.existsSync(rutaDoc)) fs.unlinkSync(rutaDoc);
            }
            if (req.files['foto']) {
                const rutaFoto = path.join(process.cwd(), 'public/uploads/documentos', req.files['foto'][0].filename);
                if (fs.existsSync(rutaFoto)) fs.unlinkSync(rutaFoto);
            }
        }
    };

    const documentoVerificacion = req.files && req.files['documento_verificacion'] ? req.files['documento_verificacion'][0].filename : null;
    const fotoPerfil = req.files && req.files['foto'] ? req.files['foto'][0].filename : null;

    if (!documentoVerificacion) {
        eliminarArchivosSiExisten();
        return res.render('medicalRegistration', {
            pagina: 'Registro de Médico - SIGCMI',
            csrfToken: obtenerCsrfToken(req),
            errores: [{ msg: 'Debes subir un documento de verificación profesional (PDF, JPG, PNG)' }],
            usuario: req.body
        });
    }

    if (!resultado.isEmpty()) {
        eliminarArchivosSiExisten();
        return res.render('medicalRegistration', {
            pagina: 'Registro de Médico - SIGCMI',
            csrfToken: obtenerCsrfToken(req),
            errores: resultado.array(), 
            usuario: req.body
        });
    }

    const { 
        nombre, apellido, tipo_documento, numero_documento, 
        genero, telefono, direccion, email, password, 
        especialidad, tarjeta_profesional, experiencia,
        precio_consulta, horarios
    } = req.body;

    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
        eliminarArchivosSiExisten();
        return res.render('medicalRegistration', {
            pagina: 'Registro de Médico - SIGCMI',
            csrfToken: obtenerCsrfToken(req),
            errores: [{ msg: 'El correo electrónico ya se encuentra registrado' }],
            usuario: req.body
        });
    }

    try {
        await Usuario.create({
            nombre, apellido, tipo_documento, numero_documento, 
            genero, telefono, direccion, email, password, 
            rol: 'medico', estado_aprobacion: 'pendiente', confirmado: true, 
            especialidad, tarjeta_profesional, experiencia, precio_consulta, 
            horarios, documento_verificacion: documentoVerificacion, foto: fotoPerfil
        });

        return res.render('templates/mensaje', {
            pagina: 'Registro Exitoso',
            mensaje: 'Tu solicitud ha sido enviada con éxito. Un administrador revisará tu documentación antes de activar tu cuenta.'
        });

    } catch (error) {
        console.error("Error al registrar médico:", error);
        eliminarArchivosSiExisten();
        return res.render('medicalRegistration', {
            pagina: 'Registro de Médico - SIGCMI',
            csrfToken: obtenerCsrfToken(req),
            errores: [{ msg: 'Ocurrió un error al procesar el registro. Inténtalo de nuevo.' }],
            usuario: req.body
        });
    }
};

const formularioMedico = (req, res) => {
    res.render("medicalRegistration", {
        tituloPagina: "Formulario de Registro - medico"
    });
};

const medicalPanel = async (req, res) => {
    try {
        const fechaHoyString = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

        const citas = await Cita.findAll({
            where: { medico_id: req.usuario.id },
            include: [{
                model: Usuario,
                as: 'paciente',
                attributes: ['nombre', 'apellido', 'telefono', 'email']
            }],
            order: [['fecha', 'ASC'], ['hora', 'ASC']]
        });

        const citasHoy = citas.filter(cita => cita.fecha === fechaHoyString && cita.estado !== 'completada');
        const proximasCitas = citas.filter(cita => cita.fecha > fechaHoyString && cita.estado !== 'completada');
        const historial = citas.filter(cita => 
            cita.fecha < fechaHoyString || 
            cita.estado === 'completada' || 
            cita.estado === 'cancelada'
        );

        res.render("medicalPanel", {
            tituloPagina: "Panel del Médico",
          
            csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : (req.body && req.body._csrf ? req.body._csrf : ''), 
            medico: req.usuario,
            citasHoy,
            proximasCitas,
            historial,
            totalCitas: citas.length
        });
    } catch (error) {
        console.error(error);
        res.render("medicalPanel", {
            tituloPagina: "Panel del Médico",
            medico: req.usuario,
            citasHoy: [],
            proximasCitas: [],
            historial: [],
            totalCitas: 0
        });
    }
};


const guardarHistoriaClinica = async (req, res) => {
    const { citaId, motivo, descripcion, resolucion } = req.body;
    const medicoId = req.usuario.id;

    try {
        const cita = await Cita.findOne({ where: { id: citaId, medico_id: medicoId } });
        
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada o no autorizada' });
        }

        await HistoriaClinica.create({
            motivo,
            descripcion,
            resolucion,
            cita_id: citaId,
            paciente_id: cita.paciente_id,
            medico_id: medicoId
        });

        cita.estado = 'completada';
        await cita.save();

        return res.json({ mensaje: 'Historia clínica guardada con éxito' });
    } catch (error) {
        console.error("Error al guardar la historia clínica:", error);
        return res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
};

const formatLocal = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const obtenerDiasSemana = (fechaReferencia) => {
    let fecha = fechaReferencia ? new Date(`${fechaReferencia}T12:00:00`) : new Date();
    let diaSemana = fecha.getDay();
    let diferencia = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); 
    
    let lunes = new Date(fecha.setDate(diferencia));
    let dias = [];
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for (let i = 0; i < 7; i++) {
        let dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        dias.push({
            nombre: nombresDias[dia.getDay()],
            fechaISO: formatLocal(dia),
            texto: `${dia.getDate()} ${nombresDias[dia.getDay()].substring(0,3)}`
        });
    }
    return dias;
};


const miAgendaSemanal = async (req, res) => {
    try {
        const medicoId = req.usuario.id; 
        const { fecha } = req.query;
        const diasSemana = obtenerDiasSemana(fecha);

       
        const citasMedico = await Cita.findAll({
            where: { medico_id: medicoId, estado: 'pendiente' },
            include: [{ model: Usuario, as: 'paciente', attributes: ['nombre', 'apellido'] }]
        });

      
        const fechaActualObj = new Date(`${diasSemana[0].fechaISO}T12:00:00`);
        const semAnterior = new Date(fechaActualObj); 
        semAnterior.setDate(semAnterior.getDate() - 7);
        const semSiguiente = new Date(fechaActualObj); 
        semSiguiente.setDate(semSiguiente.getDate() + 7);

        res.render("medicalSchedule", {
            medico: req.usuario,
            citas: citasMedico,
            diasSemana,
            fechaAnterior: formatLocal(semAnterior),
            fechaSiguiente: formatLocal(semSiguiente)
        });

    } catch (error) {
        console.error("Error al cargar la agenda:", error);
        res.redirect("medicalPanel"); 
    }
};
export {
    formularioMedico,
    medicalPanel,
    formularioRegistroMedico,
    registrarMedico,
    guardarHistoriaClinica,
    miAgendaSemanal
};