import express from 'express';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { requireSubscription, generateVideoToken, verifyVideoToken } from '../middleware/auth.js';

const router = express.Router();
const VIDEO_STORAGE_PATH = process.env.VIDEO_STORAGE_PATH || join(process.cwd(), 'videos');

/**
 * Get video access token (requires subscription)
 */
router.get('/access/:videoId', requireSubscription, async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.session.user.id;

    // Generate signed token for video access
    const token = generateVideoToken(videoId, userId);

    // Generate signed URL
    const videoUrl = `${req.protocol}://${req.get('host')}/video/stream/${videoId}?token=${token}`;

    res.json({
      hasAccess: true,
      videoUrl,
      token,
      expiresIn: 3600,
      subscription: {
        id: req.subscription.id,
        status: req.subscription.status,
        currentPeriodEnd: req.subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('Video access error:', error);
    res.status(500).json({ error: 'Failed to generate video access' });
  }
});

/**
 * Stream video with token verification
 */
router.get('/stream/:videoId', verifyVideoToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Security: prevent directory traversal
    if (videoId.includes('..') || videoId.includes('/')) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    // Construct video path (assuming .mp4 extension)
    const videoPath = join(VIDEO_STORAGE_PATH, `${videoId}.mp4`);

    // Check if file exists
    if (!existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get file stats
    const stats = await stat(videoPath);
    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      // Handle range request for video seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const stream = createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      stream.pipe(res);
    } else {
      // Stream entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);
      createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

/**
 * Get video metadata
 */
router.get('/metadata/:videoId', requireSubscription, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Security: prevent directory traversal
    if (videoId.includes('..') || videoId.includes('/')) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    const videoPath = join(VIDEO_STORAGE_PATH, `${videoId}.mp4`);

    if (!existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const stats = await stat(videoPath);

    res.json({
      videoId,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      format: 'mp4'
    });
  } catch (error) {
    console.error('Video metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

/**
 * Video player page (paywalled)
 */
router.get('/watch/:videoId', requireSubscription, (req, res) => {
  const { videoId } = req.params;
  
  res.render('video-player', {
    title: 'Sacred Video Sanctuary',
    videoId,
    user: req.session.user,
    subscription: req.subscription
  });
});

export default router;
