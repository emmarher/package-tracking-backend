import { Request, Response } from 'express';
import pool from '../database/connection';
import { LocationUpdate } from '../types';

export const getLocations = async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM locations WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo ubicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getCurrentLocations = async (req: Request, res: Response) => {
  try {
    // Obtener la ubicación más reciente de cada repartidor
    const result = await pool.query(`
      SELECT DISTINCT ON (l.user_id) 
        l.user_id, 
        l.latitude, 
        l.longitude, 
        l.timestamp,
        u.username
      FROM locations l
      JOIN users u ON l.user_id = u.id
      WHERE u.role = 'delivery'
      ORDER BY l.user_id, l.timestamp DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo ubicaciones actuales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createLocation = async (req: any, res: Response) => {
  try {
    const { latitude, longitude }: LocationUpdate = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
    }

    const result = await pool.query(
      'INSERT INTO locations (user_id, latitude, longitude) VALUES ($1, $2, $3) RETURNING *',
      [userId, latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando ubicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

