import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { swaggerConfiguration } from './config/swagger.config.js';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common'






async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet.default());

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('corsOrigins'),
    credentials: true,
  });

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
  );
  

  swaggerConfiguration(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
