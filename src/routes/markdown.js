import express from 'express';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItToc from 'markdown-it-toc-done-right';
import { requireSubscription } from '../middleware/auth.js';

const router = express.Router();

// Initialize markdown-it with plugins
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
  .use(markdownItAttrs)
  .use(markdownItAnchor)
  .use(markdownItToc);

const CONTENT_PATH = process.env.CONTENT_PATH || join(process.cwd(), 'content');

/**
 * List all available markdown files
 */
router.get('/list', async (req, res) => {
  try {
    const files = await readdir(CONTENT_PATH);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    
    res.json({
      files: markdownFiles,
      count: markdownFiles.length
    });
  } catch (error) {
    console.error('Error listing markdown files:', error);
    res.status(500).json({ error: 'Failed to list content' });
  }
});

/**
 * Render markdown file (public)
 */
router.get('/public/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(CONTENT_PATH, 'public', filename);
    const content = await readFile(filePath, 'utf-8');
    const html = md.render(content);

    res.render('markdown', {
      title: filename.replace('.md', ''),
      content: html,
      isPaid: false,
      user: req.session.user || null
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Content not found' });
    }
    console.error('Error rendering markdown:', error);
    res.status(500).json({ error: 'Failed to render content' });
  }
});

/**
 * Render markdown file (paywalled - requires subscription)
 */
router.get('/private/:filename', requireSubscription, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(CONTENT_PATH, 'private', filename);
    const content = await readFile(filePath, 'utf-8');
    const html = md.render(content);

    res.render('markdown', {
      title: filename.replace('.md', ''),
      content: html,
      isPaid: true,
      user: req.session.user,
      subscription: req.subscription
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Premium content not found' });
    }
    console.error('Error rendering markdown:', error);
    res.status(500).json({ error: 'Failed to render content' });
  }
});

/**
 * Get raw markdown content (API endpoint)
 */
router.get('/raw/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Validate type
    if (!['public', 'private'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Require subscription for private content
    if (type === 'private') {
      await new Promise((resolve, reject) => {
        requireSubscription(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(CONTENT_PATH, type, filename);
    const content = await readFile(filePath, 'utf-8');

    res.type('text/markdown').send(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Content not found' });
    }
    console.error('Error fetching raw markdown:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

export default router;
