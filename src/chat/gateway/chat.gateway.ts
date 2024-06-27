import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: ['http://localhost:8100'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log('connection');
  }

  handleDisconnect(client: any) {
    console.log('disconnect');
  }

  @SubscribeMessage('sendMessage')
  handleMessage(socket: Socket, message: string) {
    this.server.emit('newMessage', message);
  }
}
