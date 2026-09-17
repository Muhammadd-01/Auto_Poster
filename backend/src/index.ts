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
    // 1. Fetch posts that are PROCESSING, or SCHEDULED and in the past
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, post_media(media(*))')
      .or(`status.eq.PROCESSING,and(status.eq.SCHEDULED,scheduled_at.lte.${new Date().toISOString()})`);

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
        let accessToken = '';
        let authorId = '';
        
        // Fetch real token
        const { data: accounts } = await supabase
          .from('social_accounts')
          .select('access_token, provider_account_id')
          .eq('user_id', post.user_id)
          .eq('provider', 'linkedin')
          .single();
          
        if (accounts && accounts.access_token && accounts.provider_account_id) {
          accessToken = accounts.access_token;
          authorId = accounts.provider_account_id;
        } else {
          console.warn(`[Worker] Post ${post.id}: No connected LinkedIn account found for user ${post.user_id}.`);
          await supabase
            .from('posts')
            .update({ status: 'FAILED', failure_reason: 'No connected LinkedIn account found.' })
            .eq('id', post.id);
          continue;
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
            linkedinPostId = await LinkedInService.publishImagePost(accessToken, authorId, post.caption, mediaUrl);
          } else if (firstMedia.mime_type.startsWith('video/')) {
            linkedinPostId = await LinkedInService.publishVideoPost(accessToken, authorId, post.caption, mediaUrl);
          }
        } else {
          linkedinPostId = await LinkedInService.publishTextPost(accessToken, authorId, post.caption);
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

// --- Live Activity & Audit Log Store ---
interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'VISITOR' | 'AUTH_SIGNIN' | 'AUTH_SIGNUP' | 'LINKEDIN_CONNECT' | 'POST_SCHEDULE' | 'POST_PUBLISHED' | 'SYSTEM' | 'POST_DELETE' | 'LINKEDIN_SYNC';
  userEmail?: string;
  userName?: string;
  details: string;
  status: 'success' | 'warning' | 'info' | 'error';
  ip?: string;
}

const auditLogs: ActivityLog[] = [];

function logActivity(entry: Omit<ActivityLog, 'id' | 'timestamp'>) {
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 200) {
    auditLogs.pop();
  }
  return newLog;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), uptime: Math.floor(process.uptime()) });
});

/**
 * Admin Authentication & Overview Endpoints
 */
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const validEmails = [
    'muhammadaffan1445@gmail.com',
    'admin@autopost.io', 
    'admin@autopost.com', 
    'affan@autopost.io',
    'affan.work05@gmail.com'
  ];
  const validPasswords = ['ALLAHiswithyou_2', 'AdminAutoPost2026!', 'autopost2026'];

  if (
    validEmails.includes(email?.toLowerCase()?.trim()) &&
    validPasswords.includes(password)
  ) {
    logActivity({
      type: 'AUTH_SIGNIN',
      userEmail: email,
      userName: 'Platform Owner',
      details: 'Administrator logged into Admin Command Center.',
      status: 'success'
    });

    return res.json({
      success: true,
      token: 'admin-autopost-sec-jwt-2026',
      user: {
        email,
        name: 'Muhammad Affan (Platform Owner)',
        role: 'SUPERADMIN',
        permissions: ['all', 'read_users', 'read_logs', 'system_control']
      }
    });
  }

  logActivity({
    type: 'AUTH_SIGNIN',
    userEmail: email || 'unknown',
    details: `Failed admin login attempt with email: ${email}`,
    status: 'warning'
  });

  return res.status(401).json({
    success: false,
    message: 'Invalid administrative credentials. Use admin@autopost.io / AdminAutoPost2026!'
  });
});

app.get('/api/admin/overview', async (req, res) => {
  try {
    // 1. Fetch connected social accounts
    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('id, user_id, provider, provider_account_id, display_name, email, profile_url, status, created_at, updated_at');

    // 2. Fetch posts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, user_id, caption, status, scheduled_at, published_at, retry_count, failure_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    // 3. Aggregate user list
    const userMap = new Map<string, any>();

    (socialAccounts || []).forEach(acc => {
      const existing = userMap.get(acc.user_id) || {
        id: acc.user_id,
        email: acc.email || 'user@autopost.io',
        name: acc.display_name || 'Creator User',
        avatar: acc.profile_url || null,
        linkedinConnected: true,
        linkedinProfile: acc.display_name,
        postsCount: 0,
        firstSeen: acc.created_at || new Date().toISOString(),
        lastActive: acc.updated_at || new Date().toISOString(),
        plan: 'Pro Plan'
      };
      existing.linkedinConnected = true;
      existing.linkedinProfile = acc.display_name;
      if (acc.email) existing.email = acc.email;
      if (acc.display_name) existing.name = acc.display_name;
      if (acc.profile_url) existing.avatar = acc.profile_url;
      userMap.set(acc.user_id, existing);
    });

    (posts || []).forEach(p => {
      if (p.user_id) {
        const existing = userMap.get(p.user_id) || {
          id: p.user_id,
          email: 'Active User',
          name: 'Creator',
          avatar: null,
          linkedinConnected: false,
          linkedinProfile: null,
          postsCount: 0,
          firstSeen: p.created_at,
          lastActive: p.scheduled_at || p.created_at,
          plan: 'Standard'
        };
        existing.postsCount = (existing.postsCount || 0) + 1;
        userMap.set(p.user_id, existing);
      }
    });

    const usersList = Array.from(userMap.values());
    const totalScheduled = (posts || []).filter(p => p.status === 'SCHEDULED').length;
    const totalPublished = (posts || []).filter(p => p.status === 'PUBLISHED').length;
    const totalFailed = (posts || []).filter(p => p.status === 'FAILED').length;

    res.json({
      success: true,
      stats: {
        totalUsers: usersList.length,
        connectedAccounts: (socialAccounts || []).length,
        totalPosts: (posts || []).length,
        postsScheduled: totalScheduled,
        postsPublished: totalPublished,
        postsFailed: totalFailed,
        workerStatus: {
          running: true,
          uptimeSeconds: Math.floor(process.uptime()),
          lastRun: new Date().toISOString(),
          interval: 'Every 60 seconds'
        }
      },
      users: usersList,
      socialAccounts: socialAccounts || [],
      posts: posts || [],
      auditLogs: auditLogs.slice(0, 50)
    });
  } catch (err: any) {
    console.error('[Admin] Error fetching overview:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
});

app.post('/api/admin/log', (req, res) => {
  const { type, details, userEmail, userName, status } = req.body;
  if (!details) return res.status(400).json({ error: 'Missing details' });

  const log = logActivity({
    type: type || 'VISITOR',
    details,
    userEmail,
    userName,
    status: status || 'info',
    ip: req.ip
  });

  res.json({ success: true, log });
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

  logActivity({
    type: 'LINKEDIN_CONNECT',
    userEmail: String(userId),
    details: `LinkedIn OAuth authorization initiated for user: ${userId}`,
    status: 'info'
  });

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
    const profileUrl = profileData.picture || null;

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
        profile_url: profileUrl,
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
    logActivity({
      type: 'LINKEDIN_CONNECT',
      userEmail: email || userId,
      userName: displayName || 'Creator User',
      details: `Successfully connected LinkedIn account: ${displayName} (${email || 'No email'})`,
      status: 'success'
    });
    res.redirect(`${FRONTEND_URL}/accounts?success=linkedin_connected`);

  } catch (err: any) {
    console.error('[Auth] Callback processing error:', err.message || err);
    res.redirect(`${FRONTEND_URL}/accounts?error=callback_failed&details=${encodeURIComponent(err.message || 'Unknown error')}`);
  }
});

/**
 * Delete a post from Supabase and LinkedIn
 */
app.post('/api/posts/delete', async (req, res) => {
  const { postId, userId } = req.body;
  if (!postId) return res.status(400).json({ error: 'Missing postId' });

  try {
    console.log(`[Delete] Deleting post ${postId} requested by user ${userId || 'anonymous'}...`);

    // 1. Fetch post to get linkedin_post_id and user_id
    const { data: post, error: postErr } = await supabase
      .from('posts')
      .select('id, user_id, linkedin_post_id, caption')
      .eq('id', postId)
      .maybeSingle();

    if (postErr) throw postErr;

    let deletedFromLinkedIn = false;

    // 2. If post has a linkedin_post_id, attempt to delete from LinkedIn directly
    if (post && post.linkedin_post_id) {
      const targetUserId = userId || post.user_id;
      const { data: account } = await supabase
        .from('social_accounts')
        .select('access_token')
        .eq('user_id', targetUserId)
        .eq('provider', 'linkedin')
        .maybeSingle();

      if (account && account.access_token) {
        deletedFromLinkedIn = await LinkedInService.deletePost(account.access_token, post.linkedin_post_id);
      }
    }

    // 3. Delete from Supabase
    await supabase.from('post_media').delete().eq('post_id', postId);
    const { error: dbDeleteErr } = await supabase.from('posts').delete().eq('id', postId);

    if (dbDeleteErr) throw dbDeleteErr;

    logActivity({
      type: 'POST_DELETE',
      userEmail: userId || 'user',
      details: `Deleted post ${postId}${deletedFromLinkedIn ? ' (also removed from live LinkedIn)' : ''}`,
      status: 'info'
    });

    res.json({
      success: true,
      deletedFromLinkedIn,
      message: deletedFromLinkedIn
        ? 'Post deleted from database and from LinkedIn.'
        : 'Post deleted from database.'
    });
  } catch (err: any) {
    console.error('[Delete Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete post' });
  }
});

/**
 * Sync past posts from LinkedIn to Supabase
 */
app.post('/api/sync/linkedin', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    console.log(`[Sync] Syncing past LinkedIn posts for user ${userId}...`);

    // 1. Get user's LinkedIn account credentials
    const { data: account, error: accErr } = await supabase
      .from('social_accounts')
      .select('access_token, provider_account_id, display_name, email')
      .eq('user_id', userId)
      .eq('provider', 'linkedin')
      .maybeSingle();

    if (accErr || !account) {
      return res.status(404).json({ success: false, error: 'LinkedIn account not found or not connected.' });
    }

    if (!account.access_token || !account.provider_account_id) {
      return res.status(400).json({ success: false, error: 'Incomplete LinkedIn credentials.' });
    }

    // 2. Fetch posts from LinkedIn API
    const result = await LinkedInService.fetchAuthorPosts(account.access_token, account.provider_account_id);

    let syncedCount = 0;

    if (!result.error && result.elements.length > 0) {
      for (const el of result.elements) {
        const shareContent = el.specificContent?.['com.linkedin.ugc.ShareContent'];
        const text = shareContent?.shareCommentary?.text || '';
        const publishedAt = new Date(el.firstPublishedAt || el.created?.time || Date.now()).toISOString();
        const linkedinPostId = el.id;

        // Upsert post to Supabase
        const { data: existing } = await supabase
          .from('posts')
          .select('id')
          .eq('linkedin_post_id', linkedinPostId)
          .maybeSingle();

        if (!existing) {
          await supabase.from('posts').insert([
            {
              user_id: userId,
              caption: text || 'LinkedIn Update',
              status: 'PUBLISHED',
              published_at: publishedAt,
              scheduled_at: publishedAt,
              linkedin_post_id: linkedinPostId,
              timezone: 'UTC'
            }
          ]);
          syncedCount++;
        }
      }
    }

    // 3. Count current posts in Supabase for user
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    const totalInDashboard = userPosts?.length || 0;

    logActivity({
      type: 'LINKEDIN_SYNC',
      userEmail: account.email || userId,
      userName: account.display_name,
      details: result.error 
        ? `Dashboard synced (${totalInDashboard} active posts). External read restricted by LinkedIn permissions.`
        : `Synced ${syncedCount} new posts from LinkedIn into dashboard.`,
      status: 'info'
    });

    if (result.error) {
      return res.json({
        success: true,
        restricted: true,
        syncedCount: 0,
        totalInDashboard,
        message: `Dashboard refreshed! All posts authored through Auto_Poster are synchronized. (Note: Reading past posts created outside this app requires LinkedIn's Community Management API).`
      });
    }

    res.json({
      success: true,
      restricted: false,
      syncedCount,
      totalInDashboard,
      message: `Successfully synced ${syncedCount} past posts from LinkedIn!`
    });
  } catch (err: any) {
    console.error('[Sync Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to sync posts from LinkedIn.'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Backend listening on port ${PORT}`);
  console.log(`[Worker] Cron job initialized.`);
});
