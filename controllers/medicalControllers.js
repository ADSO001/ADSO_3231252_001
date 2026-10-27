import { check, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import Usuario from '../models/usuarios.js';

// Helper para obtener el token CSRF de forma segura
const obtenerCsrfToken = (req) => {
    return typeof req.csrfToken === 'function' ? req.csrfToken() : req.body._csrf;
};

// ==========================================
// MÓDULO: REGISTRO Y PANEL DEL MÉDICO
// ==========================================

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
            nombre,
            apellido,
            tipo_documento,
            numero_documento,
            genero,
            telefono,
            direccion,
            email,
            password,
            rol: 'medico',
            estado_aprobacion: 'pendiente',
            confirmado: true,
            especialidad,
            tarjeta_profesional,
            experiencia,
            precio_consulta,
            horarios,
            documento_verificacion: documentoVerificacion,
            foto: fotoPerfil
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
        pagina: "Formulario de Registro - Médico",
        csrfToken: obtenerCsrfToken(req)
    });
};

const medicalPanel = async (req, res) => {
    try {
        res.render("medicalPanel", {
            pagina: "Panel del Médico - SIGCMI",
            medico: req.usuario,
            csrfToken: obtenerCsrfToken(req),
            citasHoy: [] // Aquí se deben pasar las citas consultadas de la BD
        });
    } catch (error) {
        console.error("Error al cargar panel médico:", error);
        res.status(500).render('error', { mensaje: 'Error al abrir el panel médico' });
    }
};

// ==========================================
// MÓDULO: HISTORIA CLÍNICA (MÉDICO)
// ==========================================

const formularioCrearHistoriaClinica = (req, res) => {
    const { idCita } = req.params;
    res.render("crearHistoriaClinica", {
        pagina: "Crear Historia Clínica - SIGCMI",
        csrfToken: obtenerCsrfToken(req),
        idCita
    });
};

const guardarHistoriaClinica = async (req, res) => {
    const { idCita } = req.params;

    try {
        const { motivo_consulta, enfermedad_actual, diagnostico, tratamiento } = req.body;

        // AQUÍ VA TU CONSULTA A LA BASE DE DATOS
        return res.status(200).json({ status: 'ok', message: 'Historia clínica guardada con éxito' });

    } catch (error) {
        console.error("Error al guardar historia clínica:", error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

import db from '../config/db.js';

const renderMedicalPanel = async (req, res) => {
    try {
        const doctorId = req.usuario ? req.usuario.id : (req.user ? req.user.id : null);

        if (!doctorId) {
            return res.status(401).send('No autorizado');
        }

        // 1. Obtener la información del médico en sesión
        const [[medico]] = await db.query(
            `SELECT nombre, especialidad FROM usuarios WHERE id = ?`,
            [doctorId]
        );

        // 2. Citas programadas para HOY (pendientes)
        const [citasHoy] = await db.query(
            `SELECT a.id, a.hora, u.nombre, u.apellido, u.numero_documento
             FROM appointments a
             JOIN usuarios u ON a.patient_id = u.id
             WHERE a.doctor_id = ? AND a.fecha = CURDATE() AND a.status = 'PENDING'
             ORDER BY a.hora ASC`,
            [doctorId]
        );

        // 3. Próximas citas agendadas (futuras)
        const [proximasCitas] = await db.query(
            `SELECT a.id, a.fecha, a.hora, a.motivo, u.nombre, u.apellido, u.numero_documento
             FROM appointments a
             JOIN usuarios u ON a.patient_id = u.id
             WHERE a.doctor_id = ? AND a.fecha > CURDATE() AND a.status = 'PENDING'
             ORDER BY a.fecha ASC, a.hora ASC`,
            [doctorId]
        );

        // 4. Historial de consultas atendidas con su historia clínica
        const [historialCitas] = await db.query(
            `SELECT mh.id AS historia_id, mh.created_at AS fecha_elaboracion, mh.consultation_reason, 
                    mh.symptoms_anamnesis, mh.treatment_plan, mh.diagnosis_description,
                    u.nombre AS paciente_nombre, u.apellido AS paciente_apellido
             FROM medical_histories mh
             JOIN usuarios u ON mh.patient_id = u.id
             WHERE mh.doctor_id = ?
             ORDER BY mh.created_at DESC`,
            [doctorId]
        );

        res.render('medicalPanel', {
            pageTitle: 'SIGCMI - Panel Médico',
            medico,
            citasHoy,
            proximasCitas,
            historialCitas,
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    } catch (error) {
        console.error('Error al cargar panel médico:', error);
        res.status(500).send('Error al cargar el panel.');
    }
};

export {
    formularioMedico,
    medicalPanel,
    formularioRegistroMedico,
    registrarMedico,
    formularioCrearHistoriaClinica,
    guardarHistoriaClinica,
    renderMedicalPanel
};