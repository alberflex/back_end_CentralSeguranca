import sql from "mssql";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("Variáveis de ambiente do banco não configuradas!");
}

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool: sql.ConnectionPool | null = null;

export const conexaoMSSQL = async (): Promise<sql.ConnectionPool> => {
  if (pool) return pool;

  pool = await sql.connect(config);
  return pool;
};