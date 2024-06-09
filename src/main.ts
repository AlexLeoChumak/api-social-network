import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const logStream = fs.createWriteStream('api.log', {
  flags: 'a', // append
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(morgan('tiny', { stream: logStream }));
  await app.listen(3000);
}
bootstrap();
