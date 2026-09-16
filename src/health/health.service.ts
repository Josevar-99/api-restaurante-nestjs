import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthDao } from './dao/health.dao.js';

/**
 * Service encargado de manejar la lógica
 * relacionada con el estado de la aplicación.
 *
 * @class HealthService
 */
@Injectable()
export class HealthService {
  /**
   * Constructor del servicio.
   *
   * NestJS inyectará automáticamente la dependencia
   * HealthDao.
   *
   * @param {HealthDao} healthDao DAO de Health.
   */
  public constructor(
    private readonly healthDao: HealthDao,
  ) {}

  /**
   * Obtiene el estado actual de la aplicación.
   *
   * @returns {HealthResponseDto} Información del estado de la API.
   */
  public getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      application: this.healthDao.getApplicationName(),
      version: this.healthDao.getApplicationVersion(),
    };
  }
}