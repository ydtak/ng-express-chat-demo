import { Socket } from "socket.io";
import { AbstractSocketHandler } from "../api/abstract-socket-endpoint";
import { ChatContext } from "./chat.socket-endpoint";

export interface SendMessageRequest {
  message: string;
}

export class SendMessageSocketHandler implements AbstractSocketHandler<SendMessageRequest, ChatContext> {

  handle(data: SendMessageRequest, socket: Socket, context: ChatContext): void {
    socket.to(context.roomId).emit("message-sent", {
      message: data.message,
      senderName: context.clientName,
    });
  }

  onDisconnect(socket: Socket, context: ChatContext): void {
    // Cleanup is handled in the JoinRoomSocketHandler.
  }
}
