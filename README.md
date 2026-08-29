# RepoRadar 📡

> A longitudinal open-source activity observatory — tracks commits, PRs, issues, releases, and growth metrics for any GitHub repository, every day, automatically.

[![Daily Collect](https://github.com/<YOUR_USERNAME>/RepoRadar/actions/workflows/collect.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/RepoRadar/actions/workflows/collect.yml)

---

## What it does

GitHub Actions runs every day at 02:00 UTC and:

1. Reads the list of repositories from [`config.yml`](./config.yml)
2. Fetches activity data from the GitHub API (commits, PRs, issues, releases, stars…)
3. Writes a timestamped snapshot to `data/YYYY/MM/DD.json`
4. Updates `data/latest.json` and `data/summary.json` for the dashboard
5. Commits the new data files back to this repository
6. Builds and deploys the React dashboard to **GitHub Pages**

---

## Quick Start

### 1. Fork this repository

Click **Fork** on GitHub. The workflow runs in your own fork with your own token — no secrets to configure.

### 2. Edit `config.yml`

```yaml
repositories:
  - microsoft/vscode
  - facebook/react
  - nodejs/node
  - vercel/next.js
  - rust-lang/rust          # replace with repos you care about

settings:
  stalePRDays: 7            # PRs open longer than this are flagged "stale"
  staleIssueDays: 30        # Issues open longer than this are flagged "stale"
```

### 3. Enable GitHub Pages

1. Go to **Settings → Pages** in your fork.
2. Under **Source**, select **GitHub Actions**.
3. Save.

### 4. Run the first collection manually

Go to **Actions → Collect & Deploy → Run workflow**.

After ~2 minutes, your dashboard will be live at:
```
https://<YOUR_USERNAME>.github.io/RepoRadar/
```

---

## Running locally

### Collector

```bash
# Install dependencies
npm install

# Set your token (read-only, public repos only)
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Run the collector
npm run collect
```

This creates `data/YYYY/MM/DD.json`, `data/latest.json`, and `data/summary.json`.

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

The dev server reads `data/` from the repo root automatically.

> **Note:** The dashboard will show a "Could not load data" error until you run `npm run collect` at least once.

---

## Data format

Each daily snapshot file (`data/YYYY/MM/DD.json`) is a JSON array:

```json
[
  {
    "repository": "facebook/react",
    "date": "2026-08-29",
    "collectedAt": "2026-08-29T02:01:43.000Z",
    "commits": 37,
    "pullRequestsOpened": 14,
    "pullRequestsMerged": 21,
    "issuesOpened": 8,
    "issuesClosed": 12,
    "contributors": 43,
    "openPRs": 182,
    "stalePRs": 12,
    "staleIssues": 41,
    "stars": 248000,
    "forks": 52000,
    "watchers": 6800,
    "latestRelease": "v18.3.1",
    "latestReleaseDate": "2024-04-26T00:00:00Z",
    "daysSinceRelease": 491
  }
]
```

Historical data accumulates in `data/YYYY/MM/` — never overwritten, so after several months you have a longitudinal dataset.

---

## File structure

```
RepoRadar/
├── .github/workflows/collect.yml   # Daily scheduler + GitHub Pages deploy
├── src/                            # TypeScript data collector
│   ├── github/                     # API fetchers (commits, PRs, issues, releases)
│   ├── collectors/repo.ts          # Orchestrates one repo's collection
│   ├── processors/                 # Writes snapshot + summary JSON
│   └── index.ts                    # Entry point
├── dashboard/                      # Vite + React dashboard (GitHub Pages)
│   └── src/
│       ├── components/             # Header, SummaryCards, RepoTable, RepoCard, Sparkline
│       └── hooks/                  # useSnapshot, useHistory
├── data/                           # Collected JSON (committed by Actions)
└── config.yml                      # Your repository list
```

---

## GitHub API rate limits

The built-in `GITHUB_TOKEN` has **5,000 requests/hour**. Each tracked repository uses ~7–15 API calls depending on PR/issue page counts. The collector runs sequentially (not in parallel) to stay well within limits.

For very large repositories (e.g. linux kernel) or more than ~50 repos, create a fine-grained PAT with **read-only access to public repositories** and add it as a repository secret named `REPO_RADAR_TOKEN`, then replace `secrets.GITHUB_TOKEN` in the workflow.

---

## Roadmap

- **V1 ✅** — Daily data collector + GitHub Actions + JSON storage
- **V2 ✅** — React/Vite dashboard on GitHub Pages
- **V3** — 30-day trend charts, repository comparison view
- **V4** — Public "Add your repos" form, shared observatory

---

## License

MIT
