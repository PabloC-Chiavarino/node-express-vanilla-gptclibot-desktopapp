require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { OpenAI } = require('openai');
const { projects, urls, apps, directories } = require('./aliases');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/gpt-cli', async (req, res) => {
  const message = req.body.message?.trim();
  if (!message) return res.status(400).json({ error: 'Empty message' });

  // Matchers for access type
  const accessProjectMatch = message.match(/^access\s+-p\s+(.+)$/i);
  const accessUrlMatch = message.match(/^access\s+-w\s+(.+)$/i);
  const accessAppMatch = message.match(/^access\s+-a\s+(.+)$/i);
  const accessDirMatch = message.match(/^access\s+-d\s+(.+)$/i);

  try {
    if (accessProjectMatch) {
      const alias = accessProjectMatch[1].toLowerCase();
      const relativePath = projects[alias];
      if (!relativePath) {
        return res.json({ reply: `Project alias "${alias}" not found.` });
      }
      const fullPath = path.join(process.env.PROJECTS_ROOT, relativePath);
      const stats = await fs.promises.stat(fullPath);
      if (!stats.isDirectory()) throw new Error("Not a directory");
      exec(`code "${fullPath}"`, (err) => {
        if (err) {
          console.error(`Error opening VSCode at ${fullPath}:`, err);
          return res.status(500).json({ reply: 'Failed to open VSCode.' });
        }
        return res.json({ reply: `VSCode opened at: ${relativePath}` });
      });
      return;
    }

    if (accessUrlMatch) {
      const alias = accessUrlMatch[1].toLowerCase();
      const url = urls[alias];
      if (!url) {
        return res.json({ reply: `URL alias "${alias}" not found.` });
      }
      exec(`start "" "${url}"`, (err) => {
        if (err) {
          console.error(`Error opening URL ${url}:`, err);
          return res.status(500).json({ reply: 'Failed to open URL.' });
        }
        return res.json({ reply: `Browser opened at: ${url}` });
      });
      return;
    }

    if (accessAppMatch) {
      const alias = accessAppMatch[1].toLowerCase();
      const appPath = apps[alias];
      if (!appPath) {
        return res.json({ reply: `App alias "${alias}" not found.` });
      }
      exec(`start "" ${appPath}`, (err) => {
        if (err) {
          console.error(`Error opening app ${appPath}:`, err);
          return res.status(500).json({ reply: 'Failed to open application.' });
        }
        return res.json({ reply: `Application opened: ${alias}` });
      });
      return;
    }

    if (accessDirMatch) {
      const alias = accessDirMatch[1].toLowerCase();
      const dirPath = directories[alias];
      if (!dirPath) {
        return res.json({ reply: `Directory alias "${alias}" not found.` });
      }
      const expandedPath = dirPath.replace('%USERNAME%', process.env.USERNAME || '');
      exec(`start "" "${expandedPath}"`, (err) => {
        if (err) {
          console.error(`Error opening directory ${expandedPath}:`, err);
          return res.status(500).json({ reply: 'Failed to open directory.' });
        }
        return res.json({ reply: `Directory opened: ${alias}` });
      });
      return;
    }

    // If no match -> fallback to OpenAI chat
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are AssistGPT, a wise assistant.' },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0].message?.content.trim() || 'No response.';
    res.json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ reply: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
