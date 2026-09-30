import multer from 'multer';
import path from 'path';
import { generarId } from '../helpers/tokens.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/documentos/');
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        cb(null, generarId() + extension);
    }
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Solo se permiten archivos PDF, JPG y PNG.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

// Usamos upload.fields para capturar ambos archivos con nombres distintos de forma segura
const uploadMedicalFiles = upload.fields([
    { name: 'documento_verificacion', maxCount: 1 },
    { name: 'foto', maxCount: 1 }
]);

export default uploadMedicalFiles;