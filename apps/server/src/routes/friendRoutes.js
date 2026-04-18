import express from "express";
import { addFriend, getFriends, removeFriend } from "../controllers/friendController.js";

const router = express.Router();

router.post("/", addFriend);
router.get("/", getFriends);
router.delete("/", removeFriend);

export default router;