import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway(8080, {
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string) {
    console.log(data);
    return data;
  }

  afterInit(server: any): any {
    console.log('init');
  }
}
