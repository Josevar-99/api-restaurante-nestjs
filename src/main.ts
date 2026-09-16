import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { swaggerConfiguration } from './config/swagger.config.js';
import { ValidationPipe } from '@nestjs/common';

/**
 * Punto de entrada principal de la aplicación.
 *
 * Inicializa NestJS y levanta el servidor HTTP.
 *
 * @returns {Promise<void>}
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  swaggerConfiguration(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
