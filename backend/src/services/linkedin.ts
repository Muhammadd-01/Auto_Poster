// Mock LinkedIn Service

export class LinkedInService {
  /**
   * Simulates publishing a text post to LinkedIn
   */
  static async publishTextPost(accessToken: string, text: string) {
    console.log(`[LinkedIn Mock] Publishing text post: "${text.substring(0, 50)}..."`);
    await this.delay(1000);
    return `mock_urn_li_share_${Date.now()}`;
  }

  /**
   * Simulates publishing a post with an image to LinkedIn
   */
  static async publishImagePost(accessToken: string, text: string, imageUrl: string) {
    console.log(`[LinkedIn Mock] Publishing image post: "${text.substring(0, 50)}..." with image ${imageUrl}`);
    await this.delay(2000);
    return `mock_urn_li_share_${Date.now()}`;
  }

  /**
   * Simulates publishing a video post to LinkedIn
   */
  static async publishVideoPost(accessToken: string, text: string, videoUrl: string) {
    console.log(`[LinkedIn Mock] Publishing video post: "${text.substring(0, 50)}..." with video ${videoUrl}`);
    await this.delay(3000);
    return `mock_urn_li_share_${Date.now()}`;
  }

  private static delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
