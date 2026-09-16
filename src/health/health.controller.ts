import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthResponseDto } from './dto/health-response.dto.js';

/**
 * Controller encargado de exponer
 * los endpoints relacionados con Health.
 *
 * @class HealthController
 */
@Controller('health')
export class HealthController {
  /**
   * Constructor del controller.
   *
   * NestJS inyectará automáticamente
   * HealthService.
   *
   * @param {HealthService} healthService Servicio de Health.
   */
  public constructor(
    private readonly healthService: HealthService,
  ) {}

  /**
   * Endpoint utilizado para verificar
   * que la API se encuentra disponible.
   *
   * GET /health
   *
   * @returns {HealthResponseDto} Estado actual de la aplicación.
   */
  @Get()
  public getHealth(): HealthResponseDto {
    return this.healthService.getHealth();
  }
}