import { check, validationResult } from "express-validator";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuarios.js";
import { generarJWT, generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
    res.render("login", {
        autenticado: true,
        tituloPagina: "Inicio de Sesión",
        csrfToken: req.csrfToken()
    });
};

const formularioRegistro = (req, res) => {
    res.render("pacientRegistration", {
        tituloPagina: "Registro de Paciente",
        csrfToken: req.csrfToken()
    });
};
const vistaPrincipal = (req, res) => {
    res.render("mainview", {
        tituloPagina: "Inicio",
        csrfToken: req.csrfToken()
    });
};

const verPatientPanel = async (req, res) => {
    try {
        const { especialidad } = req.query;
        
        let condiciones = {
            rol: 'medico',
            estado_aprobacion: 'aprobado'
        };

        if (especialidad && especialidad.trim() !== '') {
            condiciones.especialidad = especialidad;
        }

        const medicos = await Usuario.findAll({
            where: condiciones
        });

        const medicosDisponibles = await Usuario.findAll({
            attributes: ['especialidad'],
            where: {
                rol: 'medico',
                estado_aprobacion: 'aprobado',
                especialidad: { [Op.not]: null }
            },
            group: ['especialidad']
        });
        
        const especialidades = medicosDisponibles.map(m => m.especialidad);

        res.render("patientPanel", {
            tituloPagina: "Panel del Paciente",
            usuario: req.usuario,
            medicos,
            especialidades,
            especialidadSeleccionada: especialidad || ''
        });

    } catch (error) {
        console.error(error);
        res.render("patientPanel", {
            tituloPagina: "Panel del Paciente",
            usuario: req.usuario,
            medicos: [],
            especialidades: []
        });
    }
};

const registrar = async (req, res) => {
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render("pacientRegistration", {
            tituloPagina: "Registro de Paciente",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: req.body
        });
    }

    const { 
        nombre, apellido, email, telefono, fecha_nacimiento, 
        password, genero, tipo_documento, numero_documento, 
        direccion, telefono_emergencia 
    } = req.body;

    try {
        const existeUsuario = await Usuario.findOne({ 
            where: { 
                [Op.or]: [
                    { email },
                    { numero_documento }
                ]
            } 
        });

        if (existeUsuario) {
            const msgError = existeUsuario.email === email 
                ? "El correo electrónico ya se encuentra registrado" 
                : "El número de documento ya se encuentra registrado";

            return res.render("pacientRegistration", {
                tituloPagina: "Registro de Paciente",
                csrfToken: req.csrfToken(),
                errores: [{ msg: msgError }],
                usuario: req.body
            });
        }

        const usuario = await Usuario.create({
            nombre,
            apellido,
            email,
            telefono,
            fecha_nacimiento,
            password,
            genero,
            tipo_documento,
            numero_documento,
            direccion,
            telefono_emergencia,
            token: generarId(),
            confirmado: false
        });

        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        }).catch(error => console.error(error));

        return res.render("templates/mensaje", {
            tituloPagina: "Cuenta Creada Correctamente",
            mensaje: "Hemos enviado un correo de confirmación, presiona en el enlace para activar tu cuenta."
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.render("pacientRegistration", {
                tituloPagina: "Registro de Paciente",
                csrfToken: req.csrfToken(),
                errores: [{ msg: "El correo o el número de documento ya están en uso." }],
                usuario: req.body
            });
        }

        return res.render("pacientRegistration", {
            tituloPagina: "Registro de Paciente",
            csrfToken: req.csrfToken(),
            errores: [{ msg: `Error del servidor: ${error.message || error}` }],
            usuario: req.body
        });
    }
};

const confirmar = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render("confirmar", {
            tituloPagina: "Cuenta confirmada",
            mensaje: "Hubo un error al confirmar la cuenta",
            error: true
        });
    }

    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render("confirmar", {
        tituloPagina: "Cuenta confirmada",
        mensaje: "La cuenta se confirmó correctamente"
    });
};

const formularioOlvidePassword = (req, res) => {
    res.render("forgotPassword", {
        tituloPagina: "Olvidé la contraseña",
        csrfToken: req.csrfToken()
    });
};

const resetPassword = async (req, res) => {
    await check("email").isEmail().withMessage("Esto no parece un correo válido").run(req);
    
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render("forgotPassword", {
            tituloPagina: "Olvidó la contraseña",
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
        return res.render("forgotPassword", {
            tituloPagina: "Recuperar contraseña",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El email no existe" }]
        });
    }

    usuario.token = generarId();
    await usuario.save();

    emailOlvidePassword({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    }).catch(error => console.error(error));

    res.render("templates/mensaje", {
        tituloPagina: "Restablecer la contraseña",
        mensaje: "Hemos enviado un correo electrónico con las instrucciones."
    });
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render("confirmar", {
            tituloPagina: "Restablecer contraseña",
            mensaje: "Hubo un error al validar el token",
            error: true
        });
    }

    res.render("resetPassword", {
        tituloPagina: "Escribe tu nueva contraseña",
        csrfToken: req.csrfToken()
    });
};

const nuevaPassword = async (req, res) => {
    await check("password").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres").run(req);
    await check("repeat_password").equals(req.body.password).withMessage("Las contraseñas no coinciden").run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render("resetPassword", {
            tituloPagina: "Restablecer Contraseña",
            csrfToken: req.csrfToken(), 
            errores: resultado.array()
        });
    }

    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render("confirmar", {
            tituloPagina: "Restablecer contraseña",
            mensaje: "Hubo un error al validar tu información, intenta de nuevo",
            error: true
        });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null; 

    await usuario.save();

    res.render("confirmar", {
        tituloPagina: "Contraseña restablecida",
        mensaje: "¡La contraseña se cambió correctamente!"
    });
};

const autenticar = async (req, res) => {
    await check("email").isEmail().withMessage("El correo es obligatorio").run(req);
    await check("password").notEmpty().withMessage("La contraseña no puede estar vacía").run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El usuario no existe" }]
        });
    }

    if (!usuario.confirmado) {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "Tu cuenta aún no ha sido confirmada. Revisa tu correo." }]
        });
    }

    const passwordCorrecto = await usuario.verificarPassword(password);
    if (!passwordCorrecto) {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "Contraseña incorrecta" }]
        });
    }

    if (usuario.rol === 'medico' && usuario.estado_aprobacion !== 'aprobado') {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "Tu cuenta de médico aún está en revisión por un administrador." }]
        });
    }

    const token = generarJWT({ 
        id: usuario.id, 
        nombre: usuario.nombre,
        rol: usuario.rol 
    });

    res.cookie("_token", token, {
        httpOnly: true,
    });

    if (usuario.rol === 'admin') {
        return res.redirect("/adminPanel");
    }

    if (usuario.rol === 'medico') {
        return res.redirect("/medicalPanel");
    }

    return res.redirect("/patientPanel");
};

const agendarCitaPaciente = async (req, res) => {
    try {
        const { doctor_id, fecha, hora, motivo } = req.body;
        const patientId = req.usuario ? req.usuario.id : (req.user ? req.user.id : null);

        if (!doctor_id || !fecha || !hora) {
            return res.status(400).render('patientPanel', {
                pageTitle: 'Panel de Paciente',
                error: 'Por favor complete todos los campos obligatorios.'
            });
        }

        // Guardar la cita directamente en PostgreSQL
        await Appointment.create({
            patient_id: patientId,
            doctor_id: doctor_id,
            fecha: fecha,
            hora: hora,
            motivo: motivo || '',
            status: 'PENDING'
        });

        // Redireccionar al panel para refrescar la lista de citas desde la BD
        res.redirect('/patientpanel');
    } catch (error) {
        console.error('Error al agendar la cita:', error);
        res.status(500).send('Error interno al agendar la cita.');
    }
};

export { 
    formularioLogin, 
    registrar, 
    formularioRegistro, 
    resetPassword, 
    formularioOlvidePassword, 
    comprobarToken, 
    nuevaPassword, 
    autenticar, 
    verPatientPanel, 
    confirmar,
    vistaPrincipal,
    agendarCitaPaciente
};