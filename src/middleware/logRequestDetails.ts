import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export function logRequestDetails(req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl, params, query, body } = req;

  logger.info(`---[Detalhes da Requisição]---`);
  logger.info(`URL: ${method} ${originalUrl}`);
  logger.info(`Params: ${JSON.stringify(params)}`);
  logger.info(`Query: ${JSON.stringify(query)}`);
  logger.info(`Body: ${JSON.stringify(body)}`);
  logger.info(`-------------------------------`);

  next();
}