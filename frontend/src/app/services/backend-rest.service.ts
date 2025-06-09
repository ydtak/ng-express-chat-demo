import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Room, User } from '../models/chat.models';

export interface BackendChatRoomsResponse {
  rooms: {
    roomId: string;
    clients: {
      clientId: string;
      clientName: string;
    }[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class BackendRestService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getChatRooms(): Observable<Room[]> {
    return this.http.get<BackendChatRoomsResponse>(`${this.baseUrl}/chat/rooms`)
      .pipe(
        map(response => this.mapChatRoomsResponse(response)),
        catchError(this.handleError)
      );
  }

  private mapChatRoomsResponse(response: BackendChatRoomsResponse): Room[] {
    return response.rooms.map(room => ({
      id: room.roomId,
      clients: room.clients.map(client => ({
        id: client.clientId,
        name: client.clientName
      }))
    }));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('BackendRestService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 