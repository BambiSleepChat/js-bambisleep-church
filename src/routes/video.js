import express from 'express';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import {
  requireSubscription,
  generateVideoToken,
  verifyVideoToken,
} from '../middleware/auth.js';
import {
  logger,
  trackSecurityEvent,
  contentAccessTotal,
  videoStreamsTotal,
  videoStreamDuration,
} from '../services/telemetry.js';

const router = express.Router();
const VIDEO_STORAGE_PATH =
  process.env.VIDEO_STORAGE_PATH || join(process.cwd(), 'videos');

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

    contentAccessTotal.inc({
      content_type: 'video',
      access_level: 'premium',
    });

    logger.info('Video access token generated', {
      videoId: videoId,
      userId: userId,
      ip: req.ip,
    });

    res.json({
      hasAccess: true,
      videoUrl,
      token,
      expiresIn: 3600,
      subscription: {
        id: req.subscription.id,
        status: req.subscription.status,
        currentPeriodEnd: req.subscription.current_period_end,
      },
    });
  } catch (error) {
    logger.error('Video access error', {
      error: error.message,
      stack: error.stack,
      videoId: req.params.videoId,
      userId: req.session.user?.id,
    });
    res.status(500).json({ error: 'Failed to generate video access' });
  }
});

/**
 * Stream video with token verification
 */
router.get('/stream/:videoId', verifyVideoToken, async (req, res) => {
  const startTime = Date.now();

  try {
    const { videoId } = req.params;

    // Security: prevent directory traversal
    if (videoId.includes('..') || videoId.includes('/')) {
      trackSecurityEvent('video_directory_traversal_attempt', 'critical', {
        videoId: videoId,
        ip: req.ip,
        userId: req.user?.id,
      });
      logger.error('Directory traversal attempt blocked', {
        videoId: videoId,
        ip: req.ip,
      });
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    // Construct video path (assuming .mp4 extension)
    const videoPath = join(VIDEO_STORAGE_PATH, `${videoId}.mp4`);

    // Check if file exists
    if (!existsSync(videoPath)) {
      logger.warn('Video not found', {
        videoId: videoId,
        path: videoPath,
        userId: req.user?.id,
      });
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get file stats
    const stats = await stat(videoPath);
    const fileSize = stats.size;
    const range = req.headers.range;

    // Track video stream start
    videoStreamsTotal.inc({ video_id: videoId, quality: 'hd' });
    logger.info('Video stream started', {
      videoId: videoId,
      userId: req.user?.id,
      fileSize: fileSize,
      range: range || 'full',
    });

    // Track duration when response finishes
    const trackDuration = () => {
      const duration = (Date.now() - startTime) / 1000;
      videoStreamDuration.observe(duration);
      logger.info('Video stream ended', {
        videoId: videoId,
        duration: duration,
      });
    };

    res.on('finish', trackDuration);
    res.on('close', trackDuration);

    if (range) {
      // Handle range request for video seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

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
    logger.error('Video streaming error', {
      error: error.message,
      stack: error.stack,
      videoId: req.params.videoId,
    });
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
      trackSecurityEvent('video_directory_traversal_attempt', 'critical', {
        videoId: videoId,
        ip: req.ip,
        userId: req.session.user?.id,
      });
      logger.error('Directory traversal attempt blocked in metadata', {
        videoId: videoId,
        ip: req.ip,
      });
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    const videoPath = join(VIDEO_STORAGE_PATH, `${videoId}.mp4`);

    if (!existsSync(videoPath)) {
      logger.warn('Video metadata not found', {
        videoId: videoId,
        userId: req.session.user?.id,
      });
      return res.status(404).json({ error: 'Video not found' });
    }

    const stats = await stat(videoPath);

    logger.info('Video metadata accessed', {
      videoId: videoId,
      userId: req.session.user?.id,
    });

    res.json({
      videoId,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      format: 'mp4',
    });
  } catch (error) {
    logger.error('Video metadata error', {
      error: error.message,
      stack: error.stack,
      videoId: req.params.videoId,
    });
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
    subscription: req.subscription,
  });
});

export default router;
