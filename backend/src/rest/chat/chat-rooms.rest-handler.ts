import { Request, Response } from "express";
import { chatRoomService } from "../../service/chat-room.service";

export interface ChatRoomsRequest {}

export interface ChatRoomsResponse {
  rooms: {
    roomId: string;
    clientCount: number;
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
      clientCount: chatRoomService.getClientsInRoom(roomId).length,
    })),
  });
};
