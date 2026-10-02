import { check, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import Usuario from '../models/usuarios.js';

// Helper para obtener el token CSRF de forma segura
const obtenerCsrfToken = (req) => {
    return typeof req.csrfToken === 'function' ? req.csrfToken() : req.body._csrf;
};

// Renderizar la vista de registro de médicos
const formularioRegistroMedico = (req, res) => {
    res.render('medicalRegistration', {
        pagina: 'Registro de Médico - SIGCMI',
        csrfToken: obtenerCsrfToken(req),
        errores: [],
        usuario: {}
    });
};

// Procesar el registro del médico
const registrarMedico = async (req, res) => {
    console.log("BODY RECIBIDO:", req.body);
    console.log("ARCHIVOS RECIBIDOS:", req.files);

    // 1. Validaciones de campos de texto (incluyendo precio_consulta y horarios si se requieren)
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

    // Helper para eliminar ambos archivos en caso de error
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

    // 2. Extraer archivos de req.files
    const documentoVerificacion = req.files && req.files['documento_verificacion'] ? req.files['documento_verificacion'][0].filename : null;
    const fotoPerfil = req.files && req.files['foto'] ? req.files['foto'][0].filename : null;

    // 3. Validar si adjuntó el documento de verificación obligatoriamente
    if (!documentoVerificacion) {
        eliminarArchivosSiExisten();
        return res.render('medicalRegistration', {
            pagina: 'Registro de Médico - SIGCMI',
            csrfToken: obtenerCsrfToken(req),
            errores: [{ msg: 'Debes subir un documento de verificación profesional (PDF, JPG, PNG)' }],
            usuario: req.body
        });
    }

    // 4. Si hay errores en las validaciones de texto
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

    // 5. Verificar si el correo ya existe
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
        tituloPagina: "Formulario de Registro - medico"
    });
};

const medicalPanel = (req, res) => {
    res.render("medicalPanel", {
        tituloPagina: "Panel del Médico"
    });
};

export {
    formularioMedico,
    medicalPanel,
    formularioRegistroMedico,
    registrarMedico
};