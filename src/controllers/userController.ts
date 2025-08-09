import { Request, Response } from 'express';
import pool from '../database/connection';

export const getDeliveryUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users WHERE role = $1 ORDER BY username',
      ['delivery']
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo repartidores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

