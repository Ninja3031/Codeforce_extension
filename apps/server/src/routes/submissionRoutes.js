import express from "express";
import { createSubmission } from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", createSubmission);

export default router;