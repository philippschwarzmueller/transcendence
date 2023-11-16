import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication<any> = await NestFactory.create(AppModule);
  const configService: ConfigService = new ConfigService();
  const hostIP: string = configService.get<string>('HOST_IP');
  app.enableCors({
    origin: [`http://${hostIP}:3000`, `http://${hostIP}:9000`],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(4000);
}
bootstrap();
