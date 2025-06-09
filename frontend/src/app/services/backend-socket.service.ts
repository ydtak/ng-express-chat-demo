import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject, of, firstValueFrom } from 'rxjs';
import { User, ChatMessage } from '../models/chat.models';
import { LOG_DEBUG, LOG_ERROR } from '../common/logger';

// join-room interfaces
export interface JoinRoomRequest {
  roomId: string;
  clientName: string;
}

export interface RoomJoinedResponse {
  clients: {
    clientId: string;
    clientName: string;
  }[];
}

export interface ClientLeftResponse {
  clientId: string;
  clientName: string;
}

export interface ClientJoinedResponse {
  clientId: string;
  clientName: string;
}

// send-message interfaces
export interface SendMessageRequest {
  message: string;
}
export interface MessageSentResponse {
  id: string;
  message: string;
  sender: {
    clientId: string;
    clientName: string;
  };
}

// connection interfaces
export interface ConnectionStatus {
  isConnected: boolean;
  error: string | null;
}

export interface ConnectionListener {
  onRoomJoined(roomJoinedResponse: RoomJoinedResponse): void;
  onClientLeft(clientLeftResponse: ClientLeftResponse): void;
  onMessageSent(messageSentResponse: MessageSentResponse): void;
}

@Injectable({
  providedIn: 'root',
})
export class BackendSocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3000';

  private connectionListeners: Map<string, ConnectionListener> = new Map();

  constructor() {}

  connect(connectionListener: ConnectionListener): Promise<ConnectionStatus> {
    if (this.socket?.connected) {
      this.connectionListeners.set(this.socket.id || '', connectionListener);
      return Promise.resolve({ isConnected: true, error: null });
    }

    // Create the socket.
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false, // Don't connect automatically
    });  
    
    // Set up socket event listeners.
    this.setupEventListeners();

    // Create a subject to notify the caller when the socket is connected.
    const connectedSubject = new Subject<ConnectionStatus>();
    this.socket.on('connect', () => {
      // Now we can safely store the listener with the actual socket ID
      this.connectionListeners.set(this.socket!.id || '', connectionListener);
      connectedSubject.next({ isConnected: true, error: null });
    });
    
    this.socket.on('connect_error', (error) => {
      connectedSubject.next({ isConnected: false, error: error.message });
    });
    
    // We're now ready to connect to the server.
    this.socket.connect();
    
    // Return a promise that resolves when the socket is connected.
    return firstValueFrom(connectedSubject.asObservable());
  }

  disconnect(): void {
    if (this.socket) {
      const socketId = this.socket.id || '';
      this.connectionListeners.delete(socketId);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, clientName: string): void {
    if (!this.socket?.connected) {
      LOG_ERROR('Not connected to server');
      return;
    }

    const request: JoinRoomRequest = { roomId, clientName };
    this.socket.emit('chat', { type: 'join-room', request });
  }

  sendMessage(message: string): void {
    if (!this.socket?.connected) {
      LOG_ERROR('Not connected to server');
      return;
    }

    if (!message.trim()) {
      LOG_ERROR('Message cannot be empty');
      return;
    }

    const request: SendMessageRequest = { message: message.trim() };
    this.socket.emit('chat', { type: 'send-message', request });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle room joined event
    this.socket.on('room-joined', (data: RoomJoinedResponse) => {
      this.notifyListeners(listener => listener.onRoomJoined(data));
    });

    // Handle client left event
    this.socket.on('client-left', (data: ClientLeftResponse) => {
      this.notifyListeners(listener => listener.onClientLeft(data));
    });

    // Handle message sent event
    this.socket.on('message-sent', (data: MessageSentResponse) => {
      this.notifyListeners(listener => listener.onMessageSent(data));
    });

    // Handle disconnect
    this.socket.on('disconnect', (reason: string) => {
      const socketId = this.socket?.id || '';
      this.connectionListeners.delete(socketId);
    });

    // Handle reconnection
    this.socket.on('reconnect', () => {
      // Note: On reconnection, the connection process should be restarted
      // as the socket ID might change
    });

    // Handle general errors
    this.socket.on('error', (error: any) => {
      LOG_ERROR(`Socket error: ${error.message || error}`);
    });
  }

  private notifyListeners(callback: (listener: ConnectionListener) => void): void {
    this.connectionListeners.forEach(listener => {
      try {
        callback(listener);
      } catch (error) {
        LOG_ERROR('Error calling listener callback:', error);
      }
    });
  }

  mapClientsToUsers(
    clients: { clientId: string; clientName: string }[]
  ): User[] {
    return clients.map((client) => ({
      id: client.clientId,
      name: client.clientName,
    }));
  }

  mapMessageToChatMessage(messageData: MessageSentResponse): ChatMessage {
    return {
      id: messageData.id,
      sender: {
        id: messageData.sender.clientId,
        name: messageData.sender.clientName,
      },
      message: messageData.message,
      timestamp: new Date().toISOString(),
    };
  }
}
