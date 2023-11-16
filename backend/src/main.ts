import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const hostIP = configService.get<string>('HOST_IP');
  console.log(hostIP);
  app.enableCors({
    origin: [`http://${hostIP}:3000`, `http://${hostIP}:9000`],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(4000);
}
bootstrap();
