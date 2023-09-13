import { Injectable } from '@nestjs/common';

@Injectable()
export class GreetingService {
  getHello(): string {
    return 'Hello my transcendence team';
  }
  getHelloPersonal(name: string): string {
    return `Hello ${name}, greetings from your NestJS Backend`;
  }
}
