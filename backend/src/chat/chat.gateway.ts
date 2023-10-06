import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";

@WebSocketGateway(8080)
export class ChatGateway implements OnGatewayInit{
  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string) {
    console.log(data);
  }

  afterInit(server: any): any {
        console.log('init')
    }
}
