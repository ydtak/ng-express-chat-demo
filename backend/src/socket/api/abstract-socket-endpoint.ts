import { Socket } from "socket.io";

// Client should implement this interface to handle the socket event.
export interface AbstractSocketHandler<P, C> {
  handle: (data: P, socket: Socket, context: C) => void;
  onDisconnect: (socket: Socket, context: C) => void;
}

// Client should extend this class to create a new socket endpoint.
export abstract class AbstractSocketEndpoint<C> {

  // Clients should register their handlers in this function.
  abstract initializeHandlers(): void;

  handlers: Map<string, AbstractSocketHandler<any, C>> = new Map();
  registerHandler(route: string, handler: AbstractSocketHandler<any, C>) {
    this.handlers.set(route, handler);
  }
  onDisconnect(socket: Socket, context: C) {
    for (const handler of this.handlers.values()) {
      handler.onDisconnect(socket, context);
    }
  }
}
