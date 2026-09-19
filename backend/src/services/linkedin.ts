
export class LinkedInService {
  /**
   * Publishes a text post to LinkedIn
   */
  static async publishTextPost(accessToken: string, authorId: string, text: string) {
    console.log(`[LinkedIn Real] Publishing text post for ${authorId}`);
    
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${authorId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[LinkedIn Error]', data);
      throw new Error(data.message || 'Failed to publish text post to LinkedIn');
    }

    return data.id as string;
  }

  static async publishImagePost(accessToken: string, authorId: string, text: string, imageUrl: string) {
    console.log(`[LinkedIn Real] Publishing image post natively...`);
    
    // 1. Register Upload
    const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${authorId}`,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      })
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error('Failed to register image upload with LinkedIn: ' + registerData.message);

    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const assetUrn = registerData.value.asset;

    // 2. Fetch image from URL (Supabase)
    const imageRes = await fetch(imageUrl);
    const imageBuffer = await imageRes.arrayBuffer();

    // 3. Upload image binary
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: Buffer.from(imageBuffer)
    });
    
    if (!uploadRes.ok) throw new Error('Failed to upload image binary to LinkedIn');

    // 4. Create Post
    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${authorId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'IMAGE',
            media: [
              {
                status: 'READY',
                media: assetUrn
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    const postData = await postRes.json();
    if (!postRes.ok) throw new Error(postData.message || 'Failed to publish image post');
    
    return postData.id as string;
  }

  static async publishVideoPost(accessToken: string, authorId: string, text: string, videoUrl: string) {
    console.log(`[LinkedIn Real] Publishing video post natively...`);
    
    // 1. Register Upload
    const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
          owner: `urn:li:person:${authorId}`,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      })
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error('Failed to register video upload with LinkedIn: ' + registerData.message);

    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const assetUrn = registerData.value.asset;

    // 2. Fetch video from URL (Supabase)
    const videoRes = await fetch(videoUrl);
    const videoBuffer = await videoRes.arrayBuffer();

    // 3. Upload video binary
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: Buffer.from(videoBuffer)
    });
    
    if (!uploadRes.ok) throw new Error('Failed to upload video binary to LinkedIn');

    // 4. Create Post
    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${authorId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'VIDEO',
            media: [
              {
                status: 'READY',
                media: assetUrn
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    const postData = await postRes.json();
    if (!postRes.ok) throw new Error(postData.message || 'Failed to publish video post');
    
    return postData.id as string;
  }

  /**
   * Deletes a published post from LinkedIn
   */
  static async deletePost(accessToken: string, postUrn: string): Promise<boolean> {
    console.log(`[LinkedIn Real] Deleting post URN: ${postUrn}`);
    try {
      const encodedUrn = encodeURIComponent(postUrn);
      const response = await fetch(`https://api.linkedin.com/v2/ugcPosts/${encodedUrn}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (response.status === 204 || response.status === 200) {
        console.log(`[LinkedIn Real] Successfully deleted post ${postUrn} on LinkedIn`);
        return true;
      }
      
      const resText = await response.text();
      console.warn(`[LinkedIn Real] Delete response (${response.status}):`, resText);
      return false;
    } catch (err: any) {
      console.error(`[LinkedIn Real] Error deleting post from LinkedIn:`, err.message || err);
      return false;
    }
  }

  /**
   * Fetches published posts for an author from LinkedIn
   */
  static async fetchAuthorPosts(accessToken: string, authorId: string): Promise<{ error: boolean; status?: number; message?: string; elements: any[] }> {
    console.log(`[LinkedIn Real] Fetching past posts for author: ${authorId}`);
    try {
      const authorUrn = encodeURIComponent(`urn:li:person:${authorId}`);
      const response = await fetch(`https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${authorUrn})&count=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          console.log(`[LinkedIn Info] Historical post reading is restricted by LinkedIn (standard Developer API allows Publishing only; reading past feed requires enterprise Community Management API).`);
        } else {
          console.warn(`[LinkedIn Warning] Fetch author posts returned status ${response.status}:`, data);
        }
        return {
          error: true,
          status: response.status,
          message: data.message || 'Permission denied by LinkedIn API',
          elements: []
        };
      }

      return {
        error: false,
        elements: data.elements || []
      };
    } catch (err: any) {
      console.error('[LinkedIn Real] Error calling fetchAuthorPosts:', err);
      return {
        error: true,
        message: err.message || 'Network error fetching from LinkedIn',
        elements: []
      };
    }
  }

  /**
   * Publishes an automated first comment on a LinkedIn post
   */
  static async publishComment(accessToken: string, authorId: string, postUrn: string, commentText: string): Promise<boolean> {
    console.log(`[LinkedIn Real] Publishing automated first comment on post ${postUrn}`);
    try {
      const encodedUrn = encodeURIComponent(postUrn);
      const response = await fetch(`https://api.linkedin.com/v2/socialActions/${encodedUrn}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          actor: `urn:li:person:${authorId}`,
          message: {
            text: commentText
          }
        })
      });

      if (response.ok || response.status === 201) {
        console.log(`[LinkedIn Real] Successfully published automated first comment on ${postUrn}`);
        return true;
      }

      const resData = await response.json().catch(() => ({}));
      console.warn(`[LinkedIn Real] Comment response status ${response.status}:`, resData);
      return false;
    } catch (err: any) {
      console.error(`[LinkedIn Real] Error publishing automated comment:`, err.message || err);
      return false;
    }
  }
}

