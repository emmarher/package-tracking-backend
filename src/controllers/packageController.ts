import { Request, Response } from 'express';
import pool from '../database/connection';
import { CreatePackageRequest, UpdatePackageStatusRequest } from '../types';

export const getPackages = async (req: any, res: Response) => {
  try {
    let query = `
      SELECT p.*, u.username as assigned_to_username 
      FROM packages p 
      LEFT JOIN users u ON p.assigned_to = u.id
    `;
    let params: any[] = [];

    // Si es repartidor, solo mostrar sus paquetes
    if (req.user.role === 'delivery') {
      query += ' WHERE p.assigned_to = $1';
      params = [req.user.id];
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo paquetes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createPackage = async (req: Request<{}, {}, CreatePackageRequest>, res: Response) => {
  try {
    const { recipient, address, assigned_to } = req.body;

    if (!recipient || !address) {
      return res.status(400).json({ error: 'Destinatario y dirección son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO packages (recipient, address, assigned_to) VALUES ($1, $2, $3) RETURNING *',
      [recipient, address, assigned_to || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando paquete:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updatePackageStatus = async (req: Request<{ id: string }, {}, UpdatePackageStatusRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await pool.query(
      'UPDATE packages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando estado del paquete:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignPackage = async (req: Request<{ id: string }, {}, { assigned_to: number }>, res: Response) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const result = await pool.query(
      'UPDATE packages SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error asignando paquete:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

