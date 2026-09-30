import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Resume Parser and Job Seeking Engine running smoothly', version: 'v1.0.0' });
});

// File parser endpoint
app.post('/api/parse', upload.single('resume'), async (req, res) => {
  try {
    let text = req.body.rawText || '';

    if (req.file) {
      const ext = (req.file.originalname || '').split('.').pop().toLowerCase();
      if (req.file.mimetype === 'application/pdf' || ext === 'pdf') {
        const parsed = await pdfParse(req.file.buffer);
        text = parsed.text || '';
      } else if (ext === 'docx' || ext === 'doc') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value || '';
      } else {
        text = req.file.buffer.toString('utf-8');
      }
    }

    res.json({ text, message: 'Extracted text successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve built frontend assets if dist folder exists
import fs from 'fs';
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>TalentTrack Backend API</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
          h1 { font-size: 20px; color: #38bdf8; margin-top: 0; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
          .btn { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; }
          .btn:hover { background: #1d4ed8; }
          code { background: #0f172a; padding: 3px 6px; border-radius: 4px; color: #38bdf8; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>TalentTrack API Server</h1>
          <p>The backend server is running smoothly on port <code>${PORT}</code>.</p>
          <p>To view the full React web application, start the Vite development server in another terminal:</p>
          <p><code>npm run dev</code></p>
          <p>And open the frontend UI at:</p>
          <a class="btn" href="http://localhost:5173" target="_blank">Open App (http://localhost:5173)</a>
        </div>
      </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
