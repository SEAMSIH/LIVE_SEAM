import express from "express";
import fs from "fs/promises"; // Use promises for fs
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Get the __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));

// Endpoint to fetch dataset image paths
app.get("/api/dataset", async (req, res) => {
  const datasetDirectory = path.join(__dirname, "public", "dataset");

  try {
    // Read all image file names from the dataset directory
    const files = await fs.readdir(datasetDirectory);

    // Filter only image files (jpg, png, etc.)
    const imagePaths = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => `/dataset/${file}`);

    res.json(imagePaths);
  } catch (err) {
    console.error("Error reading dataset directory:", err);
    res.status(500).json({ error: "Failed to read dataset" });
  }
});

// Serve a default page for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
