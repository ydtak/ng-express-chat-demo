export interface ChatMessage {
  id: string;
  sender: User;
  message: string;
  timestamp: string;
}

export interface Room {
  id: string;
  clients: User[];
}

export interface User {
  id: string;
  name: string;
}