import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { AbstractSocketEndpoint } from "./socket/api/abstract-socket-endpoint";

export class WebSocketServer {

  private socketIOServer: SocketIOServer;
  private endpoints: Map<string, AbstractSocketEndpoint<any>> = new Map();
  private clientContexts: Map<string, Map<string, any>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.socketIOServer = new SocketIOServer(httpServer, {
      cors: {
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST"],
      },
    });
  }

  // Registers a new endpoint for the WebSocket server.
  // This MUST be called before startAcceptingConnections.
  registerWebSocketEndpoint(endpoint: string, router: AbstractSocketEndpoint<any>) {
    this.endpoints.set(endpoint, router);
  }

  // Starts accepting connections.
  startAcceptingConnections() {
    this.socketIOServer.on("connection", (socket) => {
      console.log(`Socket client connected: ${socket.id}`);
      const connectionContext = this.createConnectionContext(socket.id);

      this.endpoints.forEach((endpoint, endpointName) => {
        // Initialize handlers for the endpoint.
        endpoint.initializeHandlers();

        // Handle incoming messages for the endpoint.
        socket.on(endpointName, (data: any) => {
          // Try to get the handler for the message type.
          if (!endpoint.handlers.has(data.type)) {
            this.emitError(socket, `No handler found for message type: ${data.type}`);
            return;
          }
          const handler = endpoint.handlers.get(data.type);
          if (!handler) {
            this.emitError(socket, `No handler found for message type: ${data.type}`);
            return;
          }

          // Handle the message.
          try {
            handler.handle(data.request, socket, connectionContext);
          } catch (error) {
            this.emitError(socket, `Error handling message: ${error}`);
          }
        });
      });

      // Handle disconnection for this socket.
      socket.on("disconnect", (reason) => {
        console.log(`Socket client disconnected: ${socket.id}, reason: ${reason}`);
        let connectionContext = this.clientContexts.get(socket.id);
        if (!connectionContext) {
          console.error(`No connection context found for socket: ${socket.id}`);
          connectionContext = new Map<string, any>();
        }

        // Notify each of the endpoints that the client disconnected.
        for (const endpoint of this.endpoints.values()) {
          endpoint.onDisconnect(socket, connectionContext);
        }

        // Clean up the connection context.
        this.clientContexts.delete(socket.id);
      });
    });
  }

  private emitError(socket: Socket, message: string) {
    socket.emit("error", {
      message,
    });
  }

  private createConnectionContext(socketId: string): Map<string, any> {
    const context = new Map<string, any>();
    this.clientContexts.set(socketId, context);
    this.endpoints.forEach((_, endpoint) => {
      context.set(endpoint, {});
    });
    return context;
  }
}
