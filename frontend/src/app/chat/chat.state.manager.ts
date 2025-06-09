import { Injectable } from '@angular/core';
import { ChatState } from './chat.state';
import { BackendRestService } from '../services/backend-rest.service';
import {
  BackendSocketService,
  ClientLeftResponse,
  ConnectionListener,
  MessageSentResponse,
  RoomJoinedResponse,
} from '../services/backend-socket.service';
import { LOG_DEBUG } from '../common/logger';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatStateManager implements ConnectionListener {
  private state: ChatState | null = null;

  constructor(
    private backendRestService: BackendRestService,
    private backendSocketService: BackendSocketService
  ) {}

  initialize(state: ChatState) {
    this.state = state;
    this.startLobby();
  }

  destroy() {
    this.state = null;
  }

  startLobby() {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    this.backendSocketService.disconnect();
    this.state.updateStateAndNotify({ currentView: 'lobby' });
    this.backendRestService.getChatRooms().subscribe((rooms) => {
      if (!this.state) {
        throw new Error('State is not initialized');
      }
      this.state.updateStateAndNotify({ availableRooms: rooms });
    });
  }

  startNewChat() {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    const newRoomId = uuidv4();
    this.state.updateStateAndNotify({
      currentView: 'chat',
      availableRooms: [
        ...this.state.availableRooms,
        {
          id: newRoomId,
          clients: [],
        },
      ],
      messages: [],
    });
    this.startChat(newRoomId);
  }

  async startChat(roomId: string) {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    this.state.updateStateAndNotify({
      currentView: 'chat',
      currentRoom:
        this.state.availableRooms.find((room) => room.id === roomId) ?? null,
      messages: [],
      inputMessage: '',
    });
    const connectionStatus = await this.backendSocketService.connect(this);
    if (connectionStatus.isConnected) {
      this.backendSocketService.joinRoom(roomId, this.state.currentUser.name);
    } else {
      throw new Error('Failed to connect to backend');
    }
  }

  onRoomJoined(roomJoinedResponse: RoomJoinedResponse): void {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    if (!this.state.currentRoom) {
      throw new Error('No current room to update');
    }
    this.state.updateStateAndNotify({
      currentRoom: {
        ...this.state.currentRoom,
        clients: roomJoinedResponse.clients.map((client) => {
          return {
            id: client.clientId,
            name: client.clientName,
          };
        }),
      },
    });
  }

  onClientLeft(clientLeftResponse: ClientLeftResponse): void {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    if (!this.state.currentRoom) {
      throw new Error('No current room to update');
    }
    this.state.updateStateAndNotify({
      currentRoom: {
        ...this.state.currentRoom,
        clients: this.state.currentRoom.clients.filter((client) => client.id !== clientLeftResponse.clientId),
      },
    });
  }

  onMessageSent(messageSentResponse: MessageSentResponse): void {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    this.state.updateStateAndNotify({
        messages: [...this.state.messages, {
          id: messageSentResponse.id,
          message: messageSentResponse.message,
          sender: {
            id: messageSentResponse.sender.clientId,
            name: messageSentResponse.sender.clientName,
          },
          timestamp: new Date().toISOString(),
        }],
      });
  }

  sendMessage() {
    if (!this.state) {
      throw new Error('State is not initialized');
    }
    this.backendSocketService.sendMessage(this.state.inputMessage);
    this.state.updateStateAndNotify({
      inputMessage: '',
      messages: [
        ...this.state.messages,
        {
          id: new Date().toISOString(),
          message: this.state.inputMessage,
          sender: this.state.currentUser,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }
}
