import express from 'express';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItToc from 'markdown-it-toc-done-right';
import { requireSubscription } from '../middleware/auth.js';
import {
  logger,
  trackSecurityEvent,
  contentAccessTotal,
} from '../services/telemetry.js';

const router = express.Router();

// Initialize markdown-it with plugins
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
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

    logger.info('Markdown file list requested', {
      count: markdownFiles.length,
      ip: req.ip,
    });

    res.json({
      files: markdownFiles,
      count: markdownFiles.length,
    });
  } catch (error) {
    logger.error('Error listing markdown files', {
      error: error.message,
      stack: error.stack,
    });
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
      trackSecurityEvent('markdown_directory_traversal_attempt', 'critical', {
        filename: filename,
        ip: req.ip,
        contentType: 'public',
      });
      logger.error('Directory traversal attempt blocked in public markdown', {
        filename: filename,
        ip: req.ip,
      });
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(CONTENT_PATH, 'public', filename);
    const content = await readFile(filePath, 'utf-8');
    const html = md.render(content);

    contentAccessTotal.inc({
      content_type: 'markdown',
      access_level: 'public',
    });

    logger.info('Public markdown accessed', {
      filename: filename,
      ip: req.ip,
    });

    res.render('markdown', {
      title: filename.replace('.md', ''),
      content: html,
      isPaid: false,
      user: req.session.user || null,
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('Public markdown not found', {
        filename: req.params.filename,
      });
      return res.status(404).json({ error: 'Content not found' });
    }
    logger.error('Error rendering public markdown', {
      error: error.message,
      stack: error.stack,
      filename: req.params.filename,
    });
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
      trackSecurityEvent('markdown_directory_traversal_attempt', 'critical', {
        filename: filename,
        ip: req.ip,
        userId: req.session.user?.id,
        contentType: 'private',
      });
      logger.error('Directory traversal attempt blocked in private markdown', {
        filename: filename,
        ip: req.ip,
        userId: req.session.user?.id,
      });
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(CONTENT_PATH, 'private', filename);
    const content = await readFile(filePath, 'utf-8');
    const html = md.render(content);

    contentAccessTotal.inc({
      content_type: 'markdown',
      access_level: 'premium',
    });

    logger.info('Private markdown accessed', {
      filename: filename,
      userId: req.session.user?.id,
      ip: req.ip,
    });

    res.render('markdown', {
      title: filename.replace('.md', ''),
      content: html,
      isPaid: true,
      user: req.session.user,
      subscription: req.subscription,
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('Private markdown not found', {
        filename: req.params.filename,
        userId: req.session.user?.id,
      });
      return res.status(404).json({ error: 'Premium content not found' });
    }
    logger.error('Error rendering private markdown', {
      error: error.message,
      stack: error.stack,
      filename: req.params.filename,
      userId: req.session.user?.id,
    });
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
      logger.warn('Invalid markdown content type requested', {
        type: type,
        ip: req.ip,
      });
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Require subscription for private content
    if (type === 'private') {
      await new Promise((resolve, reject) => {
        requireSubscription(req, res, err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      trackSecurityEvent('markdown_directory_traversal_attempt', 'critical', {
        filename: filename,
        ip: req.ip,
        contentType: type,
        endpoint: 'raw',
      });
      logger.error('Directory traversal attempt blocked in raw markdown', {
        filename: filename,
        type: type,
        ip: req.ip,
      });
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = join(CONTENT_PATH, type, filename);
    const content = await readFile(filePath, 'utf-8');

    contentAccessTotal.inc({
      content_type: 'markdown_raw',
      access_level: type === 'private' ? 'premium' : 'public',
    });

    logger.info('Raw markdown accessed', {
      filename: filename,
      type: type,
      userId: req.session.user?.id,
      ip: req.ip,
    });

    res.type('text/markdown').send(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('Raw markdown not found', {
        filename: req.params.filename,
        type: req.params.type,
      });
      return res.status(404).json({ error: 'Content not found' });
    }
    logger.error('Error fetching raw markdown', {
      error: error.message,
      stack: error.stack,
      filename: req.params.filename,
      type: req.params.type,
    });
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

export default router;
