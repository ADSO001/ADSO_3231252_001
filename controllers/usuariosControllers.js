import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuarios.js";
import { generarJWT, generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";
import csurf from "csurf";

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

const patientPanel = (req, res) => {
    res.render("patientPanel", {
        tituloPagina: "Panel del Paciente"
    });
}

const registrar = async (req, res) => {
    // 1. Validaciones completas con express-validator
    await check("nombre").notEmpty().withMessage("El nombre es obligatorio").run(req);
    await check("apellido").notEmpty().withMessage("El apellido es obligatorio").run(req);
    await check("email").isEmail().withMessage("Ingrese un correo electrónico válido").run(req);
    await check("telefono").notEmpty().withMessage("El teléfono es obligatorio").run(req);
    await check("fecha_nacimiento").notEmpty().withMessage("La fecha de nacimiento es obligatoria").run(req);
    await check("password").isLength({ min: 6 }).withMessage("La contraseña debe ser de al menos 6 caracteres").run(req);
    await check("repeat_password").equals(req.body.password).withMessage("Las contraseñas no coinciden").run(req);
    await check("genero").notEmpty().withMessage("Seleccione un género").run(req);
    await check("tipo_documento").notEmpty().withMessage("Seleccione un tipo de documento").run(req);
    await check("numero_documento").notEmpty().withMessage("El número de documento es obligatorio").run(req);
    await check("direccion").notEmpty().withMessage("La dirección es obligatoria").run(req);
    await check("telefono_emergencia").notEmpty().withMessage("El teléfono de emergencia es obligatorio").run(req);

    let resultado = validationResult(req);

    // Si hay errores, devolvemos la vista con los errores y los datos previamente escritos
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

    // 2. Verificar si el usuario ya existe por correo o documento
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
        return res.render("pacientRegistration", {
            tituloPagina: "Registro de Paciente",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El usuario con este correo ya está registrado" }],
            usuario: req.body
        });
    }

    // 3. Almacenar el usuario en la base de datos
    try {
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

        // Enviar correo de confirmación
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        });

        // Mostrar pantalla de éxito
        return res.render("templates/mensaje", {
            tituloPagina: "Cuenta Creada Correctamente",
            mensaje: "Hemos enviado un correo de confirmación, presiona en el enlace para activar tu cuenta."
        });

    } catch (error) {
        console.log(error);
    }
};
const confirmar = async(req, res) => {
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}});

    if(!usuario) {
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
        mensaje: "La cuenta se confirmo"
    });
}

const formularioOlvidePassword = (req, res) => {
    res.render("forgotPassword", {
        tituloPagina: "Olvide la contraseña",
        csrfToken: req.csrfToken()
    });
}

const resetPassword = async(req, res) => {
    await check("email").isEmail().withMessage("Esto no parece un correo").run(req);
    
    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        return res.render("forgotPassword", {
            tituloPagina: "Olvido la contraseña",
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    const {email} = req.body;
    const usuario = await Usuario.findOne({where: {email}});
    
    if(!usuario) {
        return res.render("forgotPassword", {
            tituloPagina: "Recuperar contraseña",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El email no existe"}]
        });
    }

    usuario.token = generarId();
    await usuario.save();

    emailOlvidePassword({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    });

    res.render("templates/mensaje", {
        tituloPagina: "Restablecer la contraseña",
        mensaje: "Hemos enviado un correo electronico para restablecer"
    });
}

const comprobarToken = async(req, res) => {
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}});

    if(!usuario){
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
}

const nuevaPassword = async(req, res) => {
    await check("password").isLength({ min: 6}).withMessage("La contraseña debe tener minimo 6 caracteres").run(req);
    await check("repeat_password").equals(req.body.password).withMessage("La contraseña no es igual").run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        return res.render("resetPassword", {
            tituloPagina: "Restablecer Contraseña",
            csrfToken: req.csrfToken(), 
            errores: resultado.array()
        });
    }

    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({where: {token}});

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null; 

    await usuario.save();

    res.render("confirmar", {
        tituloPagina: "Contraseña restablecida",
        mensaje: "La contraseña se cambio correctamente!"
    });
}

const autenticar = async(req, res) => {
    await check("email").isEmail().withMessage("El correo es obligatorio").run(req);
    await check("password").notEmpty().withMessage("La contraseña no puede estar vacia").run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    const {email, password} = req.body;
    const usuario = await Usuario.findOne({where: {email}});

    if(!usuario){
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario no existe"}]
        });
    }

    if(!usuario.confirmado) {
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario no esta confirmado"}]
        });
    }

    if(!usuario.verificarPassword(password)){
        return res.render("login", {
            tituloPagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "Contraseña incorrecta!"}]
        });
    }

    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});
     
    return res
        .cookie("_token", token, {
            httpOnly: true,
        })
        .redirect("/patientPanel"); // Asegurado con la barra inicial para redireccionar bien la ruta
}

export { 
    formularioLogin, 
    registrar, 
    formularioRegistro, 
    resetPassword, 
    formularioOlvidePassword, 
    comprobarToken, 
    nuevaPassword, 
    autenticar, 
    patientPanel, 
    confirmar 
};