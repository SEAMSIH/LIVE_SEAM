import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public folder
app.use("/capture", express.static(path.join(__dirname, "public/capture")));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/capture")); // Save files to the capture directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `capture_${Date.now()}.jpg`; // Ensure unique filenames
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Endpoint to handle image uploads
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({ filePath: `/capture/${req.file.filename}` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
