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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
