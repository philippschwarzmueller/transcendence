interface message {
  user: string;
  input: string;
}

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
  handleEvent(@MessageBody() data: message) {
    console.log(data);
    let res: string = `${data.user}: ${data.input}`;
    return res;
  }

  afterInit(server: any): any {
    console.log('init');
  }
}
