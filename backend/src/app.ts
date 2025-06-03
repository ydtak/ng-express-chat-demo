import express from "express";
import { createServer } from "http";
import { RestServer } from "./rest.server";
import { WebSocketServer } from "./web-socket.server";

// Rest Routes
import chatRoute from "./rest/chat/chat.route";

// Socket Endpoints
import { ChatSocketEndpoint } from "./socket/chat/chat.socket-endpoint";

// Initialize Express App
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Rest Server
export class RestServerEndpoints {
  static readonly CHAT_REST_ENDPOINT = "/api/chat";

  private constructor() {}
}
const restServer = new RestServer(app);
restServer.registerRestEndpoint(RestServerEndpoints.CHAT_REST_ENDPOINT, chatRoute);

// WebSocket Server
export class WebSocketServerEndpoints {
  static readonly CHAT_SOCKET_ENDPOINT = "chat";

  private constructor() {}
}
const webSocketServer = new WebSocketServer(httpServer);
webSocketServer.registerWebSocketEndpoint(WebSocketServerEndpoints.CHAT_SOCKET_ENDPOINT, new ChatSocketEndpoint());

// Start the servers
webSocketServer.startAcceptingConnections();
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
