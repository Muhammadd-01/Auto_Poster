import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { LinkedInService } from './services/linkedin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Worker: Polls every minute for scheduled posts
 */
cron.schedule('* * * * *', async () => {
  console.log(`[Worker] Checking for scheduled posts at ${new Date().toISOString()}`);

  try {
    // 1. Fetch posts that are SCHEDULED or PROCESSING and the scheduled_at time is in the past
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, post_media(media(*))')
      .in('status', ['SCHEDULED', 'PROCESSING'])
      .lte('scheduled_at', new Date().toISOString());

    if (error) {
      console.error('[Worker] Error fetching posts:', error);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('[Worker] No posts to process right now.');
      return;
    }

    console.log(`[Worker] Found ${posts.length} posts to process.`);

    for (const post of posts) {
      console.log(`[Worker] Processing post ID: ${post.id}`);

      // 2. Mark as PROCESSING to prevent duplicate processing
      await supabase
        .from('posts')
        .update({ status: 'PROCESSING' })
        .eq('id', post.id);

      try {
        let linkedinPostId = '';
        
        // Handle media
        const mediaList = post.post_media?.map((pm: any) => pm.media) || [];
        const firstMedia = mediaList[0]; // Simplified for MVP: handling first media

        if (firstMedia) {
          // Construct public URL
          const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(firstMedia.storage_path);
            
          const mediaUrl = publicUrlData.publicUrl;

          if (firstMedia.mime_type.startsWith('image/')) {
            linkedinPostId = await LinkedInService.publishImagePost('mock_token', post.caption, mediaUrl);
          } else if (firstMedia.mime_type.startsWith('video/')) {
            linkedinPostId = await LinkedInService.publishVideoPost('mock_token', post.caption, mediaUrl);
          }
        } else {
          linkedinPostId = await LinkedInService.publishTextPost('mock_token', post.caption);
        }

        // 3. Mark as PUBLISHED
        await supabase
          .from('posts')
          .update({ 
            status: 'PUBLISHED', 
            published_at: new Date().toISOString(),
            linkedin_post_id: linkedinPostId
          })
          .eq('id', post.id);

        console.log(`[Worker] Post ${post.id} published successfully!`);

      } catch (err: any) {
        console.error(`[Worker] Failed to publish post ${post.id}`, err);
        
        // 4. Handle Failure & Retries
        const newRetryCount = (post.retry_count || 0) + 1;
        if (newRetryCount >= 3) {
          await supabase
            .from('posts')
            .update({ 
              status: 'FAILED', 
              failure_reason: err.message || 'Unknown error',
              retry_count: newRetryCount 
            })
            .eq('id', post.id);
        } else {
          // Reschedule 15 minutes later
          const nextRetry = new Date(Date.now() + 15 * 60000).toISOString();
          await supabase
            .from('posts')
            .update({ 
              status: 'SCHEDULED', 
              scheduled_at: nextRetry,
              retry_count: newRetryCount 
            })
            .eq('id', post.id);
        }
      }
    }

  } catch (err) {
    console.error('[Worker] Fatal error in cron job:', err);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Backend listening on port ${PORT}`);
  console.log(`[Worker] Cron job initialized.`);
});
