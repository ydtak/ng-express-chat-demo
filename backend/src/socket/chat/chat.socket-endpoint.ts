import { AbstractSocketEndpoint } from "../api/abstract-socket-endpoint";
import { JoinRoomSocketHandler } from "./join-room.socket-handler";
import { SendMessageSocketHandler } from "./send-message.socket-handler";

export interface ChatContext {
  roomId: string;
  clientId: string;
  clientName: string;
}

export class ChatSocketEndpoint extends AbstractSocketEndpoint<ChatContext> {
  initializeHandlers() {
    this.registerHandler("join-room", new JoinRoomSocketHandler());
    this.registerHandler("send-message", new SendMessageSocketHandler());
  }
}
