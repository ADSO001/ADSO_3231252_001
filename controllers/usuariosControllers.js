import { check, validationResult } from "express-validator";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { Usuario, Cita, HistoriaClinica } from "../models/index.js";
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
    const pacienteId = req.usuario.id;

    try {
        const { especialidad } = req.query;
        const condicionesMedicos = {
            rol: 'medico',
            estado_aprobacion: 'aprobado'
        };

        if (especialidad && especialidad.trim() !== '') {
            condicionesMedicos.especialidad = especialidad.trim();
        }

        // Cada bloque se consulta de forma independiente: un problema al cargar
        // médicos o historias clínicas no debe ocultar las citas del paciente.
        const resultados = await Promise.allSettled([
            Usuario.findAll({ where: condicionesMedicos }),
            Usuario.findAll({
                attributes: ['especialidad'],
                where: {
                    rol: 'medico',
                    estado_aprobacion: 'aprobado',
                    especialidad: { [Op.not]: null }
                },
                group: ['especialidad']
            }),
            Cita.findAll({
                where: { paciente_id: pacienteId },
                include: [{
                    model: Usuario,
                    as: 'medico',
                    attributes: ['nombre', 'apellido', 'especialidad'],
                    required: false
                }],
                order: [['fecha', 'ASC'], ['hora', 'ASC']]
            }),
            HistoriaClinica.findAll({
                where: { paciente_id: pacienteId },
                include: [
                    { model: Cita, as: 'cita', attributes: ['id', 'fecha', 'hora', 'motivo'], required: false },
                    { model: Usuario, as: 'medico', attributes: ['nombre', 'apellido', 'especialidad', 'tarjeta_profesional'], required: false }
                ],
                order: [['fecha_elaboracion', 'DESC']]
            })
        ]);

        const obtenerValor = (resultado, nombre) => {
            if (resultado.status === 'fulfilled') return resultado.value;
            console.error(`No se pudieron cargar ${nombre}:`, resultado.reason);
            return [];
        };

        const medicos = obtenerValor(resultados[0], 'los médicos');
        const medicosDisponibles = obtenerValor(resultados[1], 'las especialidades');
        const misCitas = obtenerValor(resultados[2], 'las citas del paciente');
        const historiasClinicas = obtenerValor(resultados[3], 'las historias clínicas');
        const especialidades = medicosDisponibles.map(m => m.especialidad).filter(Boolean);

        return res.render("patientPanel", {
            tituloPagina: "Panel del Paciente",
            usuario: req.usuario,
            medicos,
            especialidades,
            citas: misCitas,
            historiasClinicas,
            especialidadSeleccionada: especialidad || '',
            pestanaInicial: Object.prototype.hasOwnProperty.call(req.query, 'especialidad') ? 'buscar' : 'citas',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error general al cargar el panel del paciente:', error);
        return res.status(500).send('No fue posible cargar el portal del paciente. Inténtalo nuevamente.');
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

const verAgendaMedicoParaPaciente = async (req, res) => {
    try {
        const medicos = await Usuario.findAll({
            where: { rol: 'medico', estado_aprobacion: 'aprobado' },
            attributes: ['id', 'nombre', 'apellido', 'especialidad', 'precio_consulta']
        });

        const { medicoId, fecha } = req.query;

        let fechaBase = fecha ? new Date(`${fecha}T12:00:00`) : new Date();
        
        let diaSemana = fechaBase.getDay();
        let diff = fechaBase.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        let lunes = new Date(fechaBase.setDate(diff));

        let diasSemana = [];
        const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados', 'Domingos'];
        
        for (let i = 0; i < 7; i++) {
            let d = new Date(lunes);
            d.setDate(lunes.getDate() + i);
            
            let anio = d.getFullYear();
            let mes = String(d.getMonth() + 1).padStart(2, '0');
            let dia = String(d.getDate()).padStart(2, '0');
            let fechaISO = `${anio}-${mes}-${dia}`;
            
            diasSemana.push({
                nombre: nombresDias[i],
                fechaISO: fechaISO,
                texto: `${dia}/${mes}`
            });
        }

        let semAnteriorObj = new Date(lunes);
        semAnteriorObj.setDate(semAnteriorObj.getDate() - 7);
        let semSiguienteObj = new Date(lunes);
        semSiguienteObj.setDate(semSiguienteObj.getDate() + 7);

        const formatDateISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        let citasMedico = [];
        let medicoSeleccionado = null;

        if (medicoId) {
            medicoSeleccionado = await Usuario.findByPk(medicoId);
            
            citasMedico = await Cita.findAll({
                where: { medico_id: medicoId, estado: 'pendiente' }
            });
        }

        res.render("patientScheduleAppointment", {
            usuario: req.usuario,
            medicos,
            medicoSeleccionado,
            citas: citasMedico,
            diasSemana,
            fechaAnterior: formatDateISO(semAnteriorObj),
            fechaSiguiente: formatDateISO(semSiguienteObj),
            csrfToken: req.csrfToken ? req.csrfToken() : null
        });

    } catch (error) {
        console.error("Error al cargar agenda para paciente:", error);
        res.redirect("/patientPanel");
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
    verAgendaMedicoParaPaciente
};