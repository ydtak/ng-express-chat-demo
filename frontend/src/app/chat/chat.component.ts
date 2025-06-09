import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatState } from './chat.state';
import { ChatStateManager } from './chat.state.manager';
import { NgComponentState } from '../common/ng-component.state';
import { ChatEventHandler } from './chat.event-handler';
import { ChatMessage, Room, User } from '../models/chat.models';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  providers: [ChatStateManager, ChatEventHandler],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy, ChatState {
  currentView: 'lobby' | 'chat' = 'lobby';
  availableRooms: Room[] = [];
  isCreatingRoom: boolean = false;
  currentRoom: Room | null = null;
  messages: ChatMessage[] = [];
  currentUser: User = { id: '', name: 'Anonymous' };
  inputMessage: string = '';

  constructor(
    public chatEventHandler: ChatEventHandler,
    private chatStateManager: ChatStateManager,
    private cdr: ChangeDetectorRef
  ) {}

  updateStateAndNotify(state: Partial<ChatState>) {
    Object.assign(this, state);
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.chatStateManager.initialize(this);
  }

  ngOnDestroy() {
    this.chatStateManager.destroy();
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackMessage(index: number, message: ChatMessage): string {
    return message.id;
  }
}
