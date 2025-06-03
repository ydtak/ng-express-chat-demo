import { Router } from "express";
import { getChatRoomsRestHandler } from "./chat-rooms.rest-handler";

const router = Router();

router.get("/rooms", getChatRoomsRestHandler);

export default router;
