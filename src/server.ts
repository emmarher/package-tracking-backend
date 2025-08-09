import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import packageRoutes from './routes/packages';
import locationRoutes from './routes/locations';
import userRoutes from './routes/users';
import { initializeSocket } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Inicializar Socket.io
const io = initializeSocket(server);

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export { app, io };

