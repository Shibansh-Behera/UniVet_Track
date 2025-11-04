import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/UserRoutes.js";
import reportRoutes from "./routes/ReportRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("🐾 Animal Rescue API Running..."));
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
