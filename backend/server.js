const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration - Allow all Vercel deployments and localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and all Vercel deployments
    const allowedOrigins = [
      "http://localhost:3000",
      /^https:\/\/.*\.vercel\.app$/,
      "https://my-to-do-list-danaja.vercel.app",
    ];

    // Check if origin matches any of the patterns
    const isAllowed = allowedOrigins.some((pattern) => {
      if (typeof pattern === "string") {
        return pattern === origin;
      }
      // If it's a RegExp, test it
      return pattern.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the TODO List API" });
});

// Todo routes
app.use("/api/todos", require("./routes/todoRoutes"));

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
