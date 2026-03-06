import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { getDocumentChunks, findRelevantChunks } from "./src/services/docService";
import multer from "multer";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("nexus.db");
const upload = multer({ dest: "uploads/" });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages ORDER BY timestamp ASC").all();
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { role, content } = req.body;
    const info = db.prepare("INSERT INTO messages (role, content) VALUES (?, ?)").run(role, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/messages", (req, res) => {
    db.prepare("DELETE FROM messages").run();
    res.status(204).send();
  });

  app.post("/api/docs/search", async (req, res) => {
    const { query } = req.body;
    try {
      const docsDir = path.join(__dirname, "docs");
      const chunks = await getDocumentChunks(docsDir);
      const relevant = findRelevantChunks(query, chunks);
      res.json({ chunks: relevant });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search documents" });
    }
  });

  app.post("/api/docs/upload", upload.array("files"), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    const docsDir = path.join(__dirname, "docs");

    try {
      // Ensure docs directory exists
      await fs.ensureDir(docsDir);
      
      // Clear existing docs if requested or by default for a new "workspace" session
      // For now, let's just clear it to match the "analyze this folder" intent
      await fs.emptyDir(docsDir);

      for (const file of files) {
        const originalName = file.originalname;
        // Handle folder structure if provided in originalname (some browsers do this)
        const destPath = path.join(docsDir, originalName);
        await fs.ensureDir(path.dirname(destPath));
        await fs.move(file.path, destPath, { overwrite: true });
      }

      res.json({ success: true, count: files.length });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
