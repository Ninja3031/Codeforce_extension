import "dotenv/config";
import express from "express";
import cors from "cors";
import submissionRoutes from "./routes/submissionRoutes.js";
import { connectDB } from "./config/db.js";
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/submissions", submissionRoutes);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});