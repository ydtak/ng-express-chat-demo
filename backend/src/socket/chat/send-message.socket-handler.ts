import { Socket } from "socket.io";
import { AbstractSocketHandler } from "../api/abstract-socket-endpoint";
import { ChatContext } from "./chat.socket-endpoint";
import { chatRoomService } from "../../service/chat-room.service";

export interface SendMessageRequest {
  message: string;
}

export class SendMessageSocketHandler implements AbstractSocketHandler<SendMessageRequest, ChatContext> {

  handle(data: SendMessageRequest, socket: Socket, context: ChatContext): void {
    socket.to(context.roomId).emit("message-sent", {
      id: socket.id + "-" + new Date().getTime(),
      message: data.message,
      sender: chatRoomService.getClientsInRoom(context.roomId).find((client) => client.clientId === socket.id)
    });
  }

  onDisconnect(socket: Socket, context: ChatContext): void {
    // Cleanup is handled in the JoinRoomSocketHandler.
  }
}
