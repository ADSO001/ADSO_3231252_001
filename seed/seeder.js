import Usuario from '../models/usuarios.js';
import db from '../config/db.js';

const importarDatos = async () => {
    try {
        await db.authenticate();
        await db.sync();

        const adminExiste = await Usuario.findOne({ where: { email: 'admin@sigcmi.com' } });

        if (adminExiste) {
            console.log('El usuario administrador ya existe.');
            process.exit(0);
        }

        await Usuario.create({
            nombre: 'Admin',
            apellido: 'Sistema',
            email: 'admin@sigcmi.com',
            telefono: '3000000000',
            fecha_nacimiento: '1990-01-01',
            password: 'AdminPassword123!',
            genero: 'Otro',
            tipo_documento: 'CC',
            numero_documento: '0000000000',
            direccion: 'Sede Principal SIGCMI',
            telefono_emergencia: '3000000000',
            rol: 'admin',
            confirmado: true
        });

        console.log('¡Usuario Administrador creado con éxito!');
        process.exit(0);

    } catch (error) {
        console.error('Error al insertar el administrador:', error);
        process.exit(1);
    }
};

importarDatos();