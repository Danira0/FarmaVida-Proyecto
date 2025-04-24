    import express from 'express';
    import cors from 'cors';
    import db from './config/db.js';
    import morgan from 'morgan';
    import servidor from "./app.js"

    const puerto = 4000;

    servidor.listen (puerto, () => {
        console.log(`Servidor escuchando en http://localhost:${puerto}`);
    });