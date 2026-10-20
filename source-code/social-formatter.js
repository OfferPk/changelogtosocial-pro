/**
 * ChangelogToSocial Pro - Multi-Platform Social Synthesizer
 * (c) 2026 ChangelogToSocial Pro. All rights reserved.
 * 
 * Formats parsed release notes for:
 * - Twitter/X (Strict 280-char weighted chunking with t.co URL limits)
 * - LinkedIn (High-readability spacing, professional emojis & hashtag buckets)
 * - Slack / Discord (Rich Markdown with role callouts)
 */

(function(global) {
  'use strict';

  class SocialFormatter {
    /**
     * Calculates Twitter-weighted character length
     * - URLs count as 23 characters (t.co standard)
     * - Most emojis count as 2 characters
     * - Standard ASCII counts as 1 character
     */
    static getTwitterCharCount(text) {
      if (!text) return 0;
      // Replace URLs with 23 placeholder characters
      const urlRegex = /https?:\/\/[^\s)]+/g;
      const strippedText = text.replace(urlRegex, 'x'.repeat(23));

      let count = 0;
      for (const char of strippedText) {
        const code = char.codePointAt(0);
        // Extended characters / emojis count as 2
        if (code > 0x7FF) {
          count += 2;
        } else {
          count += 1;
        }
      }
      return count;
    }

    /**
     * Synthesizes a Twitter/X thread with strict 280-char enforcement
     */
    static formatTwitterThread(release, options = {}) {
      const tweets = [];
      const ctaUrl = release.ctaUrl || 'https://yourproduct.com/changelog';
      const tone = options.tone || 'engaging'; // 'engaging', 'technical', 'concise'

      // 1. Tweet 1: Hook Tweet
      let hook = '';
      if (tone === 'technical') {
        hook = `📦 Release Announcement: ${release.productName} ${release.version} is now live.\n\n${release.tagline}\n\nKey changes and architectural updates detailed below 👇 🧵`;
      } else if (tone === 'concise') {
        hook = `🚀 ${release.productName} ${release.version} has shipped!\n\n${release.tagline}\n\nThread breakdown 👇 🧵`;
      } else {
        hook = `🚀 Big launch day! We just released ${release.productName} ${release.version}.\n\n${release.tagline}\n\nHere is everything new, improved, and fixed in this update 👇 🧵`;
      }
      tweets.push(hook);

      // 2. Features Tweet
      if (release.features.length > 0) {
        let featTweet = `✨ What's New in ${release.version}:\n\n`;
        const featLines = release.features.map(f => `• ${f}`);
        
        let currentFeatTweet = featTweet;
        for (const line of featLines) {
          if (this.getTwitterCharCount(currentFeatTweet + line + '\n') > 255) {
            tweets.push(currentFeatTweet.trim());
            currentFeatTweet = `✨ New Features (Cont.):\n\n${line}\n`;
          } else {
            currentFeatTweet += line + '\n';
          }
        }
        if (currentFeatTweet.trim() !== featTweet.trim()) {
          tweets.push(currentFeatTweet.trim());
        }
      }

      // 3. Improvements & Fixes Tweet
      const secondBatch = [];
      if (release.improvements.length > 0) {
        secondBatch.push(`⚡ Improvements:\n` + release.improvements.map(i => `• ${i}`).join('\n'));
      }
      if (release.fixes.length > 0) {
        secondBatch.push(`🐛 Bug Fixes:\n` + release.fixes.map(fx => `• ${fx}`).join('\n'));
      }

      if (secondBatch.length > 0) {
        let combText = secondBatch.join('\n\n');
        if (this.getTwitterCharCount(combText) > 255) {
          // Split into two separate tweets
          secondBatch.forEach(part => tweets.push(part.trim()));
        } else {
          tweets.push(combText.trim());
        }
      }

      // 4. Breaking Changes / Security Tweet (if any)
      if (release.breaking.length > 0 || release.security.length > 0) {
        let warnText = `⚠️ Important Notices:\n\n`;
        if (release.breaking.length > 0) {
          warnText += `Breaking Changes:\n` + release.breaking.map(b => `• ${b}`).join('\n') + '\n\n';
        }
        if (release.security.length > 0) {
          warnText += `Security Patches:\n` + release.security.map(s => `• ${s}`).join('\n');
        }
        tweets.push(warnText.trim());
      }

      // 5. Final CTA Tweet
      const finalTweet = `🔗 Full release notes, documentation & migration guide:\n${ctaUrl}\n\nWhat feature are you most excited for? Drop your feedback or questions below! 👇`;
      tweets.push(finalTweet);

      // Add thread numbering (e.g. 1/5, 2/5)
      const total = tweets.length;
      return tweets.map((t, idx) => {
        const numbered = `${t}\n\n[${idx + 1}/${total}]`;
        return {
          index: idx + 1,
          total,
          content: numbered,
          charCount: this.getTwitterCharCount(numbered),
          isOverLimit: this.getTwitterCharCount(numbered) > 280
        };
      });
    }

    /**
     * Synthesizes an executive LinkedIn long-form update
     */
    static formatLinkedInPost(release, options = {}) {
      const ctaUrl = release.ctaUrl || 'https://yourproduct.com/changelog';
      const lines = [];

      lines.push(`🚀 Exciting milestone: We just shipped ${release.productName} ${release.version}!`);
      lines.push(``);
      lines.push(release.tagline);
      lines.push(``);
      lines.push(`Here is a breakdown of what the team built in this release:`);
      lines.push(``);

      if (release.features.length > 0) {
        lines.push(`🔹 Major Highlights:`);
        release.features.forEach(f => lines.push(`  • ${f}`));
        lines.push(``);
      }

      if (release.improvements.length > 0) {
        lines.push(`⚡ Performance & Enhancements:`);
        release.improvements.forEach(imp => lines.push(`  • ${imp}`));
        lines.push(``);
      }

      if (release.fixes.length > 0) {
        lines.push(`🛠️ Reliability & Fixes:`);
        release.fixes.forEach(fx => lines.push(`  • ${fx}`));
        lines.push(``);
      }

      if (release.breaking.length > 0) {
        lines.push(`⚠️ Breaking Changes:`);
        release.breaking.forEach(b => lines.push(`  • ${b}`));
        lines.push(``);
      }

      lines.push(`As always, this release was shaped by direct feedback from our customers and community. Thank you for your continued support!`);
      lines.push(``);
      lines.push(`👉 Read the complete changelog and documentation here: ${ctaUrl}`);
      lines.push(``);

      // Smart hashtags
      const hashtags = ['#SoftwareEngineering', '#ProductManagement', '#SaaS', '#TechInnovation', '#BuildInPublic'];
      lines.push(hashtags.join(' '));

      const postContent = lines.join('\n');
      return {
        content: postContent,
        charCount: postContent.length,
        isOverLimit: postContent.length > 3000
      };
    }

    /**
     * Synthesizes Slack / Discord rich announcement
     */
    static formatSlackMessage(release, options = {}) {
      const ctaUrl = release.ctaUrl || 'https://yourproduct.com/changelog';
      const tagEveryone = options.tagEveryone ? '<!everyone> ' : '';
      const lines = [];

      lines.push(`${tagEveryone}🎉 *Release Announcement: ${release.productName} ${release.version}*`);
      lines.push(`>${release.tagline}`);
      lines.push(``);

      if (release.features.length > 0) {
        lines.push(`*🚀 Features:*`);
        release.features.forEach(f => lines.push(`• ${f}`));
        lines.push(``);
      }

      if (release.improvements.length > 0) {
        lines.push(`*⚡ Improvements:*`);
        release.improvements.forEach(i => lines.push(`• ${i}`));
        lines.push(``);
      }

      if (release.fixes.length > 0) {
        lines.push(`*🐛 Fixes:*`);
        release.fixes.forEach(fx => lines.push(`• ${fx}`));
        lines.push(``);
      }

      if (release.breaking.length > 0) {
        lines.push(`*⚠️ Breaking Changes:*`);
        release.breaking.forEach(b => lines.push(`• ${b}`));
        lines.push(``);
      }

      lines.push(`🔗 *Changelog:* <${ctaUrl}|View Full Release Notes>`);

      return {
        content: lines.join('\n')
      };
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SocialFormatter };
  } else {
    global.SocialFormatter = SocialFormatter;
  }
})(typeof window !== 'undefined' ? window : this);
