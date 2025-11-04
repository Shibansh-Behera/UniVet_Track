import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import userRouter from "./routes/UserRoutes.js"
import reportRouter from "./routes/ReportRoutes.js"
import adminRouter from "./routes/AdminRoutes.js"

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => res.send("🐾 Animal Rescue API Running..."))
app.use("/api/admin", adminRouter)
app.use("/api/users", userRouter)
app.use("/api/reports", reportRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
