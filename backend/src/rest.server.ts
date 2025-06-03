import express, { Express, Router } from "express";
import cors from "cors";

export class RestServer {
  private app: Express;

  constructor(app: Express) {
    this.app = app;

    // CORS Middleware
    app.use(
      cors({
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Middleware
    app.use(express.json());
  }

  registerRestEndpoint(endpoint: string, router: Router) {
    this.app.use(endpoint, router);
  }
}
