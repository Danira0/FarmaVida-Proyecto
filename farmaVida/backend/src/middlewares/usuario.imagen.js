// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// const uploadsPath = path.join(__dirname, '../public/uploads/usuarios/');

// if (!fs.existsSync(uploadsPath)) {
//     fs.mkdirSync(uploadsPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadsPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
//         cb(null, 'usu-' + uniqueSuffix + path.extname(sanitizedName));
//     }
// });

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, JPG, WEBP)'), false);
//     }
// };

// const upload = multer({ 
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { 
//         fileSize: 5 * 1024 * 1024, // 5MB
//         files: 1 
//     }
// });

// export const handleMulterErrors = (err, req, res, next) => {
//     if (err instanceof multer.MulterError) {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//             return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB permitido.' });
//         }
//         if (err.code === 'LIMIT_FILE_COUNT') {
//             return res.status(400).json({ message: 'Solo se permite subir un archivo a la vez.' });
//         }
//     } else if (err) {
//         return res.status(400).json({ message: err.message });
//     }
//     next();
// };

// export default upload;