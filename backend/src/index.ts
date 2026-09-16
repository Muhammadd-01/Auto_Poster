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
        let accessToken = 'mock_token';
        
        // Fetch real token
        const { data: accounts } = await supabase
          .from('social_accounts')
          .select('access_token')
          .eq('user_id', post.user_id)
          .eq('provider', 'linkedin')
          .single();
          
        if (accounts && accounts.access_token) {
          accessToken = accounts.access_token;
        }
        
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
            linkedinPostId = await LinkedInService.publishImagePost(accessToken, post.caption, mediaUrl);
          } else if (firstMedia.mime_type.startsWith('video/')) {
            linkedinPostId = await LinkedInService.publishVideoPost(accessToken, post.caption, mediaUrl);
          }
        } else {
          linkedinPostId = await LinkedInService.publishTextPost(accessToken, post.caption);
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

/**
 * LinkedIn OAuth Routes
 */
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID?.replace(/['"]/g, '').trim();
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET?.replace(/['"]/g, '').trim();
const LINKEDIN_REDIRECT_URI = (process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback').replace(/['"]/g, '').trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/['"]/g, '').trim();

app.get('/api/auth/linkedin', (req, res) => {
  console.log('[Auth] Received LinkedIn OAuth request:', req.query);
  const userId = req.query.userId;
  if (!userId) return res.status(400).send('Missing userId');
  if (!LINKEDIN_CLIENT_ID) {
    console.error('[Auth] LINKEDIN_CLIENT_ID is not configured in backend/.env');
    return res.status(500).send('LinkedIn OAuth not configured on server. Please check backend/.env file.');
  }

  const scope = 'w_member_social openid profile email';
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
  
  console.log('[Auth] Redirecting to LinkedIn:', authUrl);
  res.redirect(authUrl);
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth Error:', error, error_description);
    return res.redirect(`${FRONTEND_URL}/accounts?error=${error}`);
  }

  try {
    let userId: string;
    try {
      const decoded = Buffer.from(state as string, 'base64url').toString('utf8');
      userId = JSON.parse(decoded).userId;
    } catch {
      userId = JSON.parse(state as string).userId;
    }

    console.log(`[Auth] Step 1: Exchanging authorization code for access token with LinkedIn...`);
    // Exchange code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('[Auth] Token exchange failed:', tokenData);
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for token');
    }

    console.log('[Auth] Step 2: Access token obtained successfully.');
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // Usually 60 days

    console.log('[Auth] Step 3: Fetching user profile from LinkedIn OpenID endpoint...');
    // Get user profile info using OpenID Connect
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('[Auth] Profile fetch failed:', profileData);
      throw new Error(profileData.message || 'Failed to fetch LinkedIn profile information');
    }

    console.log(`[Auth] Step 4: Profile fetched for user: ${profileData.name} (${profileData.email})`);
    const providerAccountId = profileData.sub;
    const displayName = profileData.name;
    const email = profileData.email;

    // Calculate expiry
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    console.log(`[Auth] Step 5: Upserting social_accounts in Supabase for user_id: ${userId}...`);
    // Upsert into Supabase `social_accounts`
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: userId,
        provider: 'linkedin',
        provider_account_id: providerAccountId,
        display_name: displayName,
        email: email,
        access_token: accessToken, // Note: In production, this should be encrypted
        expires_at: expiresAt,
        status: 'CONNECTED',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' });

    if (dbError) {
      console.error('[Auth] Supabase DB error:', dbError);
      throw new Error(`Database error: ${dbError.message || dbError.code}`);
    }

    console.log('[Auth] Success! LinkedIn account connected and saved.');
    res.redirect(`${FRONTEND_URL}/accounts?success=linkedin_connected`);

  } catch (err: any) {
    console.error('[Auth] Callback processing error:', err.message || err);
    res.redirect(`${FRONTEND_URL}/accounts?error=callback_failed&details=${encodeURIComponent(err.message || 'Unknown error')}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Backend listening on port ${PORT}`);
  console.log(`[Worker] Cron job initialized.`);
});
