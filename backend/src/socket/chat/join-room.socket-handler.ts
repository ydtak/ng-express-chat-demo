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
    chatRoomService.joinRoom(data.roomId, socket.id, data.clientName);

    // Record the client's name in the client's connection context.
    context.roomId = data.roomId;
    context.clientId = socket.id;
    context.clientName = data.clientName;

    // Notify the client that they have joined the room.
    socket.to(data.roomId).emit("room-joined", { 
      clients: chatRoomService.getClientsInRoom(data.roomId),
     });
  }

  onDisconnect(socket: Socket, context: ChatContext): void {
    // Notify the room that the client has left.
    socket.to(context.roomId).emit("client-left", {
      clientId: context.clientId,
      clientName: context.clientName,
    });

    // Leave the room.
    chatRoomService.leaveRoom(context.roomId, context.clientId);
    socket.leave(context.roomId);
  }
}
