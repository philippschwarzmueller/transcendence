import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";

@WebSocketGateway(8080)
export class ChatGateway {
  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string) {
    console.log(data);
  }
}
