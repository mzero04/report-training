import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Daily Report Summarizer
  app.post('/api/summarize-daily-report', async (req, res) => {
    try {
      const { date, records } = req.body;

      if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'No records provided for summarization.' });
      }

      const prompt = `You are an expert technical training coordinator and engineering manager.
Analyze the following daily team training and progress logs for date: "${date}".

Log records:
${JSON.stringify(records, null, 2)}

Provide a structured, professional executive daily training report briefing in JSON format with these exact keys:
1. "summary": A concise executive paragraph (2-3 sentences) summarizing overall team progress, core milestones, and curriculum completed.
2. "highlights": An array of 3-5 concise bullet points highlighting key modules mastered (e.g. Pre-Layout, Sewing Sub Layout, Algorism, etc.).
3. "blockersOrRemarks": An array of any trainee questions, discrepancies (e.g. TRUE checks), or items requiring mentor follow-up. If none, return ["All trainees progressed smoothly without blockers."].
4. "trainerHighlights": An array of 2-3 bullet points regarding trainer engagement and guidance.

Respond ONLY with valid JSON, no markdown code fence blocks or extra text.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json(parsed);
    } catch (err: unknown) {
      console.error('Error generating AI report summary:', err);
      return res.status(500).json({
        error: 'Failed to generate AI summary',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
