import { Injectable } from "@angular/core";
import { ChatStateManager } from "./chat.state.manager";

@Injectable()
export class ChatEventHandler {
  
  constructor(private chatStateManager: ChatStateManager) {

  }

  clickCreateRoom() {
    this.chatStateManager.startNewChat();
  }

  clickJoinRoom(roomId: string) {
    this.chatStateManager.startChat(roomId);
  }

  clickLeaveRoom() {
    this.chatStateManager.startLobby();
  }

  clickSendMessage() {
    this.chatStateManager.sendMessage();
  }

  onMessageKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.clickSendMessage();
    }
  }
}
