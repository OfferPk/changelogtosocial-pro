# ChangelogToSocial Pro — User Guide & Social Distribution Manual

Welcome to **ChangelogToSocial Pro**, your automated release note parser, Twitter/X thread chunker, and LinkedIn announcement studio.

---

## 1\. Quick Start

### 1.1 Running the Visual Studio

1. Open `source-code/index.html` in any web browser.  
2. Select an industry preset from the dropdown (SaaS Major Release, Consumer Mobile App, or Developer CLI) or paste your own `CHANGELOG.md`.  
3. Choose your preferred social tone:  
   - **Engaging & Energetic**: High-conversion founder launch style with emojis and hook question.  
   - **Technical & Architectural**: DevRel and engineering focus with direct architectural summaries.  
   - **Concise & Direct**: Minimalist product updates for fast reading.  
4. Preview the synthesized **Twitter / X Thread**, verify that all tweet badges show `Safe to Post` (under 280 characters), and click **Copy Full Thread** or copy individual tweets.  
5. Switch to the **LinkedIn Post** or **Slack / Discord** tab to copy tailored announcements for your community.

---

## 2\. Using the Automation CLI in CI/CD

ChangelogToSocial Pro includes a standalone command-line tool (`build/changelogtosocial-cli.py`) for automated release generation in GitHub Actions or GitLab CI:

\# Print Twitter/X Thread from CHANGELOG.md

python3 build/changelogtosocial-cli.py \--input CHANGELOG.md \--twitter

\# Print formatted LinkedIn announcement

python3 build/changelogtosocial-cli.py \--input CHANGELOG.md \--linkedin

\# Export all social assets into a release folder

python3 build/changelogtosocial-cli.py \\

  \--input source-code/templates/saas-major-release.json \\

  \--export-dir ./dist/release-social-assets

---

## 3\. GitHub Actions CI/CD Integration Example

Add the following step to `.github/workflows/release.yml`:

name: Generate Social Release Assets

on:

  release:

    types: \[published\]

jobs:

  social:

    runs-on: ubuntu-latest

    steps:

      \- uses: actions/checkout@v4

      \- name: Generate Social Formats

        run: |

          python3 build/changelogtosocial-cli.py \--input CHANGELOG.md \--export-dir ./social-assets

      \- name: Upload Social Assets

        uses: actions/upload-artifact@v4

        with:

          name: social-campaign-assets

          path: ./social-assets