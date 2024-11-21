import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 1234;

// Enable CORS for all origins
app.use(cors({ origin: "*" }));

// Middleware to serve static files from the web_model directory
app.use(
  "/project/workspace/web_model",
  express.static(path.join(__dirname, "web_model"), {
    setHeaders: (res, filePath) => {
      // Set Cache-Control for better caching in service workers
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// Root route for server testing
app.get("/", (req, res) => {
  res.send(
    "Server is running. Model is available at /project/workspace/web_model/model.json"
  );
});

// Route to test loading the model.json file
app.get("/test-model", (req, res) => {
  const modelPath = path.join(__dirname, "web_model", "model.json");
  res.sendFile(modelPath, (err) => {
    if (err) {
      console.error("Error sending model.json:", err);
      res.status(404).send("Model file not found");
    }
  });
});

// Catch-all route to handle unsupported routes
app.use((req, res) => {
  res.status(404).send("Route not found. Please check your URL.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
