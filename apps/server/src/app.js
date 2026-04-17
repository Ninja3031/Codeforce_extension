import "dotenv/config";
import express from "express";
import cors from "cors";
import submissionRoutes from "./routes/submissionRoutes.js";
import { connectDB } from "./config/db.js";
import friendRoutes from "./routes/friendRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";





connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/submissions", submissionRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contest", contestRoutes);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});