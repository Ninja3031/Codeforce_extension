import express from "express";
import { addFriend, getFriends } from "../controllers/friendController.js";

const router = express.Router();

router.post("/", addFriend);
router.get("/", getFriends);

export default router;