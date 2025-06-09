import { ChatMessage, Room, User } from '../models/chat.models';
import { NgComponentState } from '../common/ng-component.state';

export interface ChatState extends NgComponentState<ChatState> {
  currentView: 'lobby' | 'chat';
  availableRooms: Room[];
  isCreatingRoom: boolean;
  currentRoom: Room | null;
  messages: ChatMessage[];  
  currentUser: User;
  inputMessage: string;
}