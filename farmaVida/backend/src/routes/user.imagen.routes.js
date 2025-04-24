// import { Router } from "express";
// import {
//   getUserImage,
//   uploadUserImage,
//   updateUserImage,
//   deleteUserImage
// } from "../controllers/user.imagen.controller.js";
// import upload from '../middlewares/usuario.imagen.js';
// import { handleMulterErrors } from '../middlewares/usuario.imagen.js';

// const router = Router();

// // Ruta para obtener imagen
// router.get('/:id', getUserImage);

// // Ruta para subir nueva imagen
// router.post('/', 
//   upload.single('imagen'), 
//   handleMulterErrors, 
//   uploadUserImage
// );

// // Ruta para actualizar imagen
// router.put('/:id', 
//   upload.single('imagen'), 
//   handleMulterErrors, 
//   updateUserImage
// );

// // Ruta para eliminar imagen
// router.delete('/:id', deleteUserImage);

// export default router;