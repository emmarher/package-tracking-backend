import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database connection configuration loaded from environment variables');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tracking_package_mvp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export default pool;

