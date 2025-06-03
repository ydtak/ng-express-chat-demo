import { Socket } from "socket.io";
import { AbstractSocketHandler } from "../api/abstract-socket-endpoint";
import { ChatContext } from "./chat.socket-endpoint";
import { chatRoomService } from "../../service/chat-room.service";

export interface JoinRoomRequest {
  roomId: string;
  clientName: string;
}

export class JoinRoomSocketHandler implements AbstractSocketHandler<JoinRoomRequest, ChatContext> {

  handle(data: JoinRoomRequest, socket: Socket, context: ChatContext): void {
    // Join the room.
    socket.join(data.roomId);
    chatRoomService.joinRoom(data.roomId, socket.id);

    // Record the client's name in the client's connection context.
    context.clientName = data.clientName;

    // Notify the client that they have joined the room.
    socket.emit("room-joined", {});
  }

  onDisconnect(socket: Socket, context: ChatContext): void {
    // Notify the room that the client has left.
    socket.to(context.roomId).emit("client-left", {
      clientId: socket.id,
      clientName: context.clientName,
    });

    // Leave the room.
    chatRoomService.leaveRoom(context.roomId, socket.id);
    socket.leave(context.roomId);
  }
}
