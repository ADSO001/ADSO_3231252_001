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

const verPatientPanel = (req, res) => {
    res.render("patientPanel", {
        tituloPagina: "Panel del Paciente"
    });
};

const registrar = async (req, res) => {
    // 1. Extraer errores de express-validator
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
        // 2. Verificar si ya existe un usuario con ESE CORREO o ESE DOCUMENTO
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

        // 3. Crear el usuario en la Base de Datos
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

        // 4. Enviar correo de confirmación
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        }).catch(error => console.error("Error enviando correo de registro:", error));

        return res.render("templates/mensaje", {
            tituloPagina: "Cuenta Creada Correctamente",
            mensaje: "Hemos enviado un correo de confirmación, presiona en el enlace para activar tu cuenta."
        });

    } catch (error) {
        console.error("Error detallado en el servidor:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.render("pacientRegistration", {
                tituloPagina: "Registro de Paciente",
                csrfToken: req.csrfToken(),
                errores: [{ msg: "El correo o el número de documento ya están en uso." }],
                usuario: req.body
            });
        }

        // Muestra el error real en pantalla si algo más falla (ej. formato de fecha o tipo de dato)
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
    }).catch(error => console.error("Error enviando correo de recuperación:", error));

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

    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
      
    return res
        .cookie("_token", token, {
            httpOnly: true,
        })
        .redirect("/patientPanel");
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
    confirmar 
};