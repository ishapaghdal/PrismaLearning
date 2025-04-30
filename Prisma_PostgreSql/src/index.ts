import express from "express";
import cors from "cors";
import projectRoutes from "./routes/projectRoute";

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Set to true if your requests include credentials like cookies
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", projectRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Prisma PostgreSQL API!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
