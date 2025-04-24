import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js'; 
import ProveedorRoutes from './routes/labo.routes.js';
import ProductoRoute from './routes/producto.routes.js';
import MovimientoRoutes from './routes/movimiento.routes.js';
import AdmicrudRoutes from './routes/admi.routes.js';
import EmpleadoRoute from './routes/emple.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}));


app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Rutas
app.use("/api", authRoutes);  
app.use("/api", ProveedorRoutes);
app.use("/api", ProductoRoute);
app.use("/api", MovimientoRoutes);
app.use("/api", AdmicrudRoutes);
app.use("/api", EmpleadoRoute);
export default app;
