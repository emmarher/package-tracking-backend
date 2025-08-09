import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as jwt from 'jsonwebtoken';
import pool from '../database/connection';

export const initializeSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:4200",
      methods: ["GET", "POST"]
    }
  });

  // Middleware de autenticación para Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token requerido'));
      }

      const decoded = (jwt as any).verify(token, process.env.JWT_SECRET as string) as { userId: number };
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
      
      if (result.rows.length === 0) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.data.user = result.rows[0];
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`Usuario conectado: ${user.username} (${user.role})`);

    // Unir a sala según el rol
    if (user.role === 'admin') {
      socket.join('admins');
    } else if (user.role === 'delivery') {
      socket.join('delivery');
      socket.join(`delivery_${user.id}`);
    }

    // Manejar actualizaciones de ubicación
    socket.on('location_update', async (data) => {
      try {
        console.log('📍 Socket recibió ubicación de:', user.username, data);
        
        if (user.role !== 'delivery') {
          console.warn('⚠️ Usuario no es repartidor, ignorando ubicación');
          return;
        }

        const { latitude, longitude } = data;
        
        // Guardar en base de datos
        await pool.query(
          'INSERT INTO locations (user_id, latitude, longitude) VALUES ($1, $2, $3)',
          [user.id, latitude, longitude]
        );
        console.log('✅ Ubicación guardada en BD para usuario:', user.id);

        // Enviar a administradores
        const locationData = {
          user_id: user.id,
          username: user.username,
          latitude,
          longitude,
          timestamp: new Date()
        };
        
        socket.to('admins').emit('delivery_location_update', locationData);
        console.log('📡 Ubicación enviada a admins:', locationData);

      } catch (error) {
        console.error('❌ Error actualizando ubicación:', error);
      }
    });

    // Manejar cambios de estado de paquetes
    socket.on('package_status_change', async (data) => {
      try {
        const { packageId, status } = data;
        
        // Actualizar en base de datos
        const result = await pool.query(
          'UPDATE packages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [status, packageId]
        );

        if (result.rows.length > 0) {
          // Notificar a administradores
          io.to('admins').emit('package_updated', result.rows[0]);
          
          // Notificar al repartidor específico si está asignado
          if (result.rows[0].assigned_to) {
            io.to(`delivery_${result.rows[0].assigned_to}`).emit('package_updated', result.rows[0]);
          }
        }

      } catch (error) {
        console.error('Error actualizando estado del paquete:', error);
      }
    });

    // Manejar asignación de paquetes
    socket.on('package_assigned', (data) => {
      const { packageData, deliveryUserId } = data;
      
      // Notificar al repartidor asignado
      io.to(`delivery_${deliveryUserId}`).emit('new_package_assigned', packageData);
      
      // Notificar a otros administradores
      socket.to('admins').emit('package_assignment_updated', packageData);
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${user.username}`);
    });
  });

  return io;
};

