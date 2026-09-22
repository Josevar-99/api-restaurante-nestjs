import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const swaggerConfiguration = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Restaurant menu Categories')
    .setDescription('Crud categories')
    .setVersion('v1.0.0')
    .addBearerAuth()
    .addTag('Category')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'API Key')
    .build();

    apis: ['./src/category/*.ts']

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
};
