export class ChatRoomService {
  private roomIdToClients: Map<string, Set<string>> = new Map();

  getRoomIds() {
    return Array.from(this.roomIdToClients.keys());
  }

  getClientsInRoom(roomId: string) {
    return Array.from(this.roomIdToClients.get(roomId) || []);
  }

  joinRoom(roomId: string, clientId: string) {
    if (!this.roomIdToClients.has(roomId)) {
      this.roomIdToClients.set(roomId, new Set());
    }
    this.roomIdToClients.get(roomId)!.add(clientId);
  }

  leaveRoom(roomId: string, clientId: string) {
    this.roomIdToClients.get(roomId)?.delete(clientId);
    if ((this.roomIdToClients.get(roomId)?.size || 0) === 0) {
      this.roomIdToClients.delete(roomId);
    }
  }
}

export const chatRoomService = new ChatRoomService();
