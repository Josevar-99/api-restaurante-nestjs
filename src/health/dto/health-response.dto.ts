/**
 * DTO utilizado para representar la respuesta
 * del endpoint de health check.
 *
 * @class HealthResponseDto
 */
export class HealthResponseDto {
  /**
   * Estado actual de la API.
   *
   * @type {string}
   */
  status: string;

  /**
   * Fecha y hora en la que se generó la respuesta.
   *
   * @type {string}
   */
  timestamp: string;

  /**
   * Nombre de la aplicación.
   *
   * @type {string}
   */
  application: string;

  /**
   * Versión de la aplicación.
   *
   * @type {string}
   */
  version: string;
}