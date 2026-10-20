/**
 * ChangelogToSocial Pro - Markdown & Release Notes Parser Engine
 * (c) 2026 ChangelogToSocial Pro. All rights reserved.
 * 
 * Supports:
 * - Keep a Changelog standard (https://keepachangelog.com)
 * - GitHub Release Notes / Tag format
 * - Custom bulleted Markdown with section headers
 */

(function(global) {
  'use strict';

  class ParserEngine {
    static parseMarkdown(markdownText) {
      if (!markdownText || typeof markdownText !== 'string') {
        return this.getDefaultRelease();
      }

      const lines = markdownText.split('\n');
      const release = {
        productName: '',
        version: '',
        date: '',
        tagline: '',
        features: [],
        improvements: [],
        fixes: [],
        breaking: [],
        security: [],
        other: [],
        ctaUrl: ''
      };

      let currentSection = 'other';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for top-level Header (# App Name or # Changelog)
        if (line.startsWith('# ') && !release.productName) {
          release.productName = line.replace('# ', '').replace(/changelog/i, '').trim();
          continue;
        }

        // Check for version header: e.g. ## [2.4.0] - 2026-09-29 or ## v2.4.0 (2026-09-29)
        const versionMatch = line.match(/^##\s+\[?v?([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:-[a-zA-Z0-9.]+)?)]?(?:\s*-\s*|\s*\()([0-9]{4}-[0-9]{2}-[0-9]{2})?\)?/i);
        if (versionMatch) {
          if (!release.version) {
            release.version = `v${versionMatch[1]}`;
            if (versionMatch[2]) release.date = versionMatch[2];
          }
          continue;
        }

        // Check for sub-headings (### Added, ### Features, etc.)
        if (line.startsWith('### ') || line.startsWith('#### ')) {
          const heading = line.replace(/^#+\s+/, '').toLowerCase();
          if (heading.includes('add') || heading.includes('feat') || heading.includes('new')) {
            currentSection = 'features';
          } else if (heading.includes('chang') || heading.includes('improv') || heading.includes('enhanc')) {
            currentSection = 'improvements';
          } else if (heading.includes('fix') || heading.includes('bug')) {
            currentSection = 'fixes';
          } else if (heading.includes('break') || heading.includes('deprecat')) {
            currentSection = 'breaking';
          } else if (heading.includes('secur')) {
            currentSection = 'security';
          } else {
            currentSection = 'other';
          }
          continue;
        }

        // Check for bullet points (- or *)
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const item = line.replace(/^[-*]\s+/, '').trim();
          if (item) {
            if (currentSection === 'features') release.features.push(item);
            else if (currentSection === 'improvements') release.improvements.push(item);
            else if (currentSection === 'fixes') release.fixes.push(item);
            else if (currentSection === 'breaking') release.breaking.push(item);
            else if (currentSection === 'security') release.security.push(item);
            else release.other.push(item);
          }
          continue;
        }

        // Check for URL in text
        const urlMatch = line.match(/https?:\/\/[^\s)]+/);
        if (urlMatch && !release.ctaUrl) {
          release.ctaUrl = urlMatch[0];
        }

        // If no tagline yet and line has substance (not a link, not a header)
        if (!release.tagline && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && line.length > 10) {
          release.tagline = line;
        }
      }

      // Fallbacks
      if (!release.productName) release.productName = 'Product';
      if (!release.version) release.version = 'v1.0.0';
      if (!release.date) release.date = new Date().toISOString().split('T')[0];
      if (!release.tagline && release.features.length > 0) {
        release.tagline = release.features[0];
      }

      return release;
    }

    static getDefaultRelease() {
      return {
        productName: 'CloudScale AI',
        version: 'v2.4.0',
        date: '2026-09-29',
        tagline: 'Autonomous agent clusters, real-time webhook replay, and SOC2 compliance monitoring.',
        features: [
          'Autonomous Agent Clusters with distributed multi-region failover',
          'Client-side HMAC-SHA256 Webhook Replayer for Stripe and GitHub',
          'Instant 1-click BIND DNS zone file exporter'
        ],
        improvements: [
          '50% reduction in cold boot latency across serverless edge functions',
          'Revamped high-contrast cybersecurity dark theme'
        ],
        fixes: [
          'Fixed race condition in OAuth callback state verification',
          'Resolved memory leak in streaming SSE log pipeline'
        ],
        breaking: [
          'Deprecated v1 REST endpoints; migrate to v2 GraphQL or WebSocket subscriptions'
        ],
        security: [
          'Patched timing attack vulnerability in signature header validation'
        ],
        other: [],
        ctaUrl: 'https://cloudscale.ai/changelog/v2-4-0'
      };
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParserEngine };
  } else {
    global.ParserEngine = ParserEngine;
  }
})(typeof window !== 'undefined' ? window : this);
