import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const logDir = (process.env.CAMINHO_LOG || 'logs').replace(/\\+$/, '');
const logFile = path.join(logDir, process.env.ARQUIVO_LOG || 'app.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: logFile }),
  ],
});

export default logger;