import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app: INestApplication<any> = await NestFactory.create(AppModule);
  const configService: ConfigService = new ConfigService();
  const hostIP: string = configService.get<string>('HOST_IP');
  app.enableCors({
    origin: [`http://${hostIP}:3000`, `http://${hostIP}:9000`],
    credentials: true,
  });
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(4000);
}
bootstrap();
