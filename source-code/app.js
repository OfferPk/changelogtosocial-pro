/**
 * ChangelogToSocial Pro - Application Controller & State Manager
 * (c) 2026 ChangelogToSocial Pro. All rights reserved.
 */

document.addEventListener('DOMContentLoaded', () => {
  let state = {
    activeTab: 'twitter',
    tone: 'engaging',
    rawMarkdown: `# CloudScale AI Changelog\n\n## [2.4.0] - 2026-09-29\n\nAutonomous Agent Clusters, real-time cryptographic webhook replayer, and SOC2 automated compliance audit telemetry.\n\n### Added\n- Autonomous Agent Clusters with distributed multi-region failover and self-healing nodes\n- Client-side HMAC-SHA256 Webhook Replayer for Stripe, GitHub, Shopify, and Slack\n- Instant 1-click BIND DNS zone file exporter and SPF lookup budget meter\n\n### Changed\n- 50% reduction in cold boot latency across serverless edge functions\n- Revamped high-contrast cybersecurity dark theme with accessible typography\n\n### Fixed\n- Fixed race condition in OAuth callback state verification\n- Resolved memory leak in streaming SSE log pipeline during socket reconnects\n\n### Breaking Changes\n- Deprecated v1 REST endpoints; migrate to v2 GraphQL or WebSocket subscriptions by Dec 2026\n\n### Security\n- Patched timing attack vulnerability in signature header validation using constant-time comparison\n\nhttps://cloudscale.ai/changelog/v2-4-0`,
    ctaUrl: 'https://cloudscale.ai/changelog/v2-4-0',
    tagEveryone: false
  };

  // DOM Elements
  const elPresetSelect = document.getElementById('presetSelect');
  const elTone = document.getElementById('tone');
  const elCtaUrl = document.getElementById('ctaUrl');
  const elRawMarkdown = document.getElementById('rawMarkdown');
  const elTagEveryone = document.getElementById('tagEveryone');

  const elTabTwitter = document.getElementById('tabTwitter');
  const elTabLinkedIn = document.getElementById('tabLinkedIn');
  const elTabSlack = document.getElementById('tabSlack');

  const elTwitterView = document.getElementById('twitterView');
  const elLinkedInView = document.getElementById('linkedInView');
  const elSlackView = document.getElementById('slackView');

  const elTweetContainer = document.getElementById('tweetContainer');
  const elLinkedInBody = document.getElementById('linkedInBody');
  const elLinkedInCharCount = document.getElementById('linkedInCharCount');
  const elSlackBody = document.getElementById('slackBody');

  // Action Buttons
  const elBtnCopyThread = document.getElementById('btnCopyThread');
  const elBtnCopyLinkedIn = document.getElementById('btnCopyLinkedIn');
  const elBtnCopySlack = document.getElementById('btnCopySlack');
  const elBtnExportJson = document.getElementById('btnExportJson');

  function syncForm() {
    elTone.value = state.tone;
    elCtaUrl.value = state.ctaUrl;
    elRawMarkdown.value = state.rawMarkdown;
    elTagEveryone.checked = Boolean(state.tagEveryone);
    updateVisuals();
  }

  function readForm() {
    state.tone = elTone.value;
    state.ctaUrl = elCtaUrl.value.trim();
    state.rawMarkdown = elRawMarkdown.value;
    state.tagEveryone = elTagEveryone.checked;
    updateVisuals();
  }

  function updateVisuals() {
    // 1. Parse raw changelog markdown
    const release = ParserEngine.parseMarkdown(state.rawMarkdown);
    if (state.ctaUrl) release.ctaUrl = state.ctaUrl;

    // 2. Synthesize Twitter Thread
    const twitterThread = SocialFormatter.formatTwitterThread(release, { tone: state.tone });
    renderTwitterThread(twitterThread, release);

    // 3. Synthesize LinkedIn Post
    const linkedInPost = SocialFormatter.formatLinkedInPost(release, { tone: state.tone });
    elLinkedInBody.textContent = linkedInPost.content;
    elLinkedInCharCount.textContent = `${linkedInPost.charCount} / 3,000 characters`;

    // 4. Synthesize Slack Message
    const slackMsg = SocialFormatter.formatSlackMessage(release, { tagEveryone: state.tagEveryone });
    elSlackBody.textContent = slackMsg.content;

    // Cache
    try {
      localStorage.setItem('changelogtosocial_state', JSON.stringify(state));
    } catch (e) {}
  }

  function renderTwitterThread(tweets, release) {
    let html = '';
    tweets.forEach(t => {
      let charClass = 'char-safe';
      if (t.charCount > 280) charClass = 'char-over';
      else if (t.charCount > 250) charClass = 'char-warn';

      html += `
        <div class="tweet-card">
          <div class="tweet-header">
            <div class="tweet-user">
              <div class="avatar-circle">⚡</div>
              <div>
                <div class="user-name">${escapeHtml(release.productName)} <span style="color:#1d9bf0;">✓</span></div>
                <div class="user-handle">@${escapeHtml(release.productName.toLowerCase().replace(/[^a-z0-9]/g, ''))} &bull; Tweet ${t.index}/${t.total}</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-copy-tweet" data-text="${encodeURIComponent(t.content)}" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Copy Tweet</button>
          </div>
          <div class="tweet-body">${escapeHtml(t.content)}</div>
          <div class="tweet-footer">
            <span class="char-badge ${charClass}">${t.charCount} / 280 chars</span>
            <span style="font-size:0.75rem; color:#71767b;">${t.isOverLimit ? '⚠️ Exceeds 280' : '✓ Safe to Post'}</span>
          </div>
        </div>
      `;
    });
    elTweetContainer.innerHTML = html;

    // Attach individual tweet copy buttons
    elTweetContainer.querySelectorAll('.btn-copy-tweet').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.dataset.text);
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        });
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Tab switching
  function switchTab(tab) {
    state.activeTab = tab;
    elTabTwitter.classList.toggle('active', tab === 'twitter');
    elTabLinkedIn.classList.toggle('active', tab === 'linkedin');
    elTabSlack.classList.toggle('active', tab === 'slack');

    elTwitterView.style.display = tab === 'twitter' ? 'block' : 'none';
    elLinkedInView.style.display = tab === 'linkedin' ? 'block' : 'none';
    elSlackView.style.display = tab === 'slack' ? 'block' : 'none';
  }

  elTabTwitter.addEventListener('click', () => switchTab('twitter'));
  elTabLinkedIn.addEventListener('click', () => switchTab('linkedin'));
  elTabSlack.addEventListener('click', () => switchTab('slack'));

  // Form listeners
  elTone.addEventListener('change', readForm);
  elCtaUrl.addEventListener('input', readForm);
  elRawMarkdown.addEventListener('input', readForm);
  elTagEveryone.addEventListener('change', readForm);

  // Copy Entire Twitter Thread
  elBtnCopyThread.addEventListener('click', () => {
    const release = ParserEngine.parseMarkdown(state.rawMarkdown);
    if (state.ctaUrl) release.ctaUrl = state.ctaUrl;
    const tweets = SocialFormatter.formatTwitterThread(release, { tone: state.tone });
    const fullText = tweets.map(t => t.content).join('\n\n---\n\n');

    navigator.clipboard.writeText(fullText).then(() => {
      const orig = elBtnCopyThread.textContent;
      elBtnCopyThread.textContent = 'Copied Thread!';
      setTimeout(() => { elBtnCopyThread.textContent = orig; }, 2000);
    });
  });

  // Copy LinkedIn Post
  elBtnCopyLinkedIn.addEventListener('click', () => {
    navigator.clipboard.writeText(elLinkedInBody.textContent).then(() => {
      const orig = elBtnCopyLinkedIn.textContent;
      elBtnCopyLinkedIn.textContent = 'Copied Post!';
      setTimeout(() => { elBtnCopyLinkedIn.textContent = orig; }, 2000);
    });
  });

  // Copy Slack Message
  elBtnCopySlack.addEventListener('click', () => {
    navigator.clipboard.writeText(elSlackBody.textContent).then(() => {
      const orig = elBtnCopySlack.textContent;
      elBtnCopySlack.textContent = 'Copied Message!';
      setTimeout(() => { elBtnCopySlack.textContent = orig; }, 2000);
    });
  });

  // Export JSON Manifest
  elBtnExportJson.addEventListener('click', () => {
    const release = ParserEngine.parseMarkdown(state.rawMarkdown);
    if (state.ctaUrl) release.ctaUrl = state.ctaUrl;
    const tweets = SocialFormatter.formatTwitterThread(release, { tone: state.tone });
    const linkedIn = SocialFormatter.formatLinkedInPost(release, { tone: state.tone });
    const slack = SocialFormatter.formatSlackMessage(release, { tagEveryone: state.tagEveryone });

    const manifest = {
      product: release.productName,
      version: release.version,
      date: release.date,
      twitterThread: tweets,
      linkedInPost: linkedIn,
      slackMessage: slack
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-campaign-${release.version.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Preset Template Loader
  elPresetSelect.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (!val) return;
    try {
      const res = await fetch(`templates/${val}.json`);
      if (res.ok) {
        const tmpl = await res.json();
        state.rawMarkdown = tmpl.rawMarkdown;
        syncForm();
      }
    } catch (err) {
      console.warn('Preset loader fallback', err);
    }
  });

  // Restore cache if exists
  try {
    const cached = localStorage.getItem('changelogtosocial_state');
    if (cached) state = JSON.parse(cached);
  } catch (e) {}

  syncForm();
  switchTab(state.activeTab || 'twitter');
});
