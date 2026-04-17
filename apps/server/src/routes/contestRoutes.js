import express from "express";
import { getFriendsStandings } from "../controllers/contestController.js";

const router = express.Router();

router.get("/friends", getFriendsStandings);

export default router;