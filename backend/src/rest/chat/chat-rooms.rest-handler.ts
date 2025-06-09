import { Request, Response } from "express";
import { chatRoomService } from "../../service/chat-room.service";

export interface ChatRoomsRequest {}

export interface ChatRoomsResponse {
  rooms: {
    roomId: string;
    clients: {
      clientId: string;
      clientName: string;
    }[];
  }[];
}

export const getChatRoomsRestHandler = async (
  req: Request<{}, {}, {}, ChatRoomsRequest>,
  res: Response<ChatRoomsResponse>
) => {
  const rooms = chatRoomService.getRoomIds();
  res.json({
    rooms: rooms.map((roomId) => ({
      roomId,
      clients: chatRoomService.getClientsInRoom(roomId),
    })),
  });
};
