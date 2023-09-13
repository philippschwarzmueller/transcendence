import { Controller, Get, Param } from '@nestjs/common';
import { GreetingService } from './app.service';

@Controller('hello')
export class AppController {
  constructor(private readonly appService: GreetingService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(":id")
  getHelloPersonal(@Param() params: any): string {
    return this.appService.getHelloPersonal(params.id);
  }
}
