export class ChatRoomService {
  private roomIdToClients: Map<string, Set<string>> = new Map();
  private clientIdToName: Map<string, string> = new Map();

  getRoomIds() {
    return Array.from(this.roomIdToClients.keys());
  }

  getClientsInRoom(roomId: string): { clientId: string; clientName: string }[] {
    return Array.from(this.roomIdToClients.get(roomId) || []).map(
      (clientId) => ({
        clientId,
        clientName: this.clientIdToName.get(clientId) || "",
      })
    );
  }

  joinRoom(roomId: string, clientId: string, clientName: string) {
    if (!this.roomIdToClients.has(roomId)) {
      this.roomIdToClients.set(roomId, new Set());
    }
    this.roomIdToClients.get(roomId)!.add(clientId);
    this.clientIdToName.set(clientId, clientName);
  }

  leaveRoom(roomId: string, clientId: string) {
    this.roomIdToClients.get(roomId)?.delete(clientId);
    this.clientIdToName.delete(clientId);
    if ((this.roomIdToClients.get(roomId)?.size || 0) === 0) {
      this.roomIdToClients.delete(roomId);
    }
  }
}

export const chatRoomService = new ChatRoomService();
