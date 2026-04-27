# Trading Journal

[![React](https://img.shields.io/badge/React-19-20232A?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![ESLint](https://img.shields.io/badge/ESLint-Configured-4B32C3?logo=eslint)](https://eslint.org/)

A bilingual trading journal built with React, Vite, and Firebase for logging executions, reviewing performance, and spotting patterns in your trading behavior.

## What This App Does

This project is a discretionary trading journal with two working modes:

- `Live mode` using Firebase Authentication and Firestore
- `Demo mode` for trying the full UI without signing in

It is designed to help traders:

- record trades with execution details
- track account balance and currency display
- review performance through a dashboard
- filter and inspect trade history
- spot behavior patterns such as FOMO, over-risking, and strong sessions

## Current Feature Set

### Dashboard

The dashboard is the main review surface and currently includes:

- `4 summary cards`
  - Total Trades
  - Win Rate
  - Total Profit
  - Average RR
- `Equity Curve`
  - cumulative profit over time
- `Analytics`
  - best trading session
  - timeframe performance
  - strategy performance
- `AI Insight cards`
  - lightweight rule-based insights from journal data
- `Tag Analysis`
  - quick read on tag-level win/loss tendencies
- `Recent Trades`
  - last few executions for fast review

### Trade Logging

You can log trades with:

- date and time
- pair
- buy / sell direction
- entry / stop loss / take profit
- PnL
- lot size
- risk percent
- strategy
- session
- timeframe
- emotion
- followed plan
- tags
- notes

The form also calculates RR automatically from entry, stop loss, and take profit.

### History

The history view supports:

- filter by pair
- filter by result
- filter by strategy
- trade detail modal
- trade deletion

When filters are active in live mode, the app falls back to client-side filtering to avoid Firestore composite-index friction for the current scope of the project.

### Auth and User State

- register with email/password
- login with email/password
- automatic profile document creation
- faster post-auth loading flow
- Firebase-ready fallback messaging when config is missing

### Profile and Preferences

- account balance controls
  - set
  - add
  - subtract
  - clear
- currency display switcher
  - `USD`
  - `THB`
  - `EUR`
  - `CENT`
- Thai / English language toggle

## Live Mode vs Demo Mode

| Mode | What it uses | Purpose |
|---|---|---|
| `Live` | Firebase Auth + Firestore | Real user data and persistence |
| `Demo` | Local demo dataset | Quick exploration without setup |

Demo mode mirrors the major product flows so the UI can be reviewed even before Firebase is fully configured.

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 19, React DOM |
| Build tool | Vite 8 |
| Backend services | Firebase Auth, Firestore, Firebase Storage |
| Styling | Custom CSS |
| Linting | ESLint |

## Project Structure

```txt
src/
  assets/
  hooks/
    useAuth.js
    useTrades.js
  services/
    authService.js
    firebase.js
    tradeService.js
  utils/
    demoData.js
    helpers.js
  App.jsx
  App.css
  index.css
  main.jsx
```

### Key Files

- [`src/App.jsx`](./src/App.jsx)
  Main application shell, page routing, dashboard UI, auth UI, add-trade form, history view, and modal flow.

- [`src/hooks/useAuth.js`](./src/hooks/useAuth.js)
  Resolves Firebase auth state, handles loading, and refreshes the Firestore user profile.

- [`src/hooks/useTrades.js`](./src/hooks/useTrades.js)
  Loads trades, supports pagination, demo-mode behavior, add/delete flow, and filtered history behavior.

- [`src/services/authService.js`](./src/services/authService.js)
  Auth helpers for register, login, logout, profile creation, and preference updates.

- [`src/services/tradeService.js`](./src/services/tradeService.js)
  Firestore persistence for trades, monthly stats, and account summary updates.

- [`src/utils/helpers.js`](./src/utils/helpers.js)
  Analytics helpers, formatting utilities, dashboard aggregations, currency metadata, and demo-safe tag normalization.

- [`src/utils/demoData.js`](./src/utils/demoData.js)
  Local demo dataset used when the app runs in demo mode.

## Data Shape

### User document

The app expects a user profile document under:

```txt
users/{uid}
```

Typical fields:

- `displayName`
- `email`
- `totalTrades`
- `winCount`
- `lossCount`
- `beCount`
- `totalProfit`
- `avgRR`
- `avgRisk`
- `accountBalance`
- `currencyCode`

### Trade document

Trades are stored under:

```txt
users/{uid}/trades/{tradeId}
```

Typical fields include:

- `date`
- `pair`
- `type`
- `entry`
- `sl`
- `tp`
- `lot`
- `riskPercent`
- `rr`
- `result`
- `pnl`
- `strategy`
- `session`
- `timeframe`
- `emotion`
- `followPlan`
- `tags`
- `note`

### Monthly summary

Monthly aggregates are written to:

```txt
users/{uid}/stats/{yyyy-mm}
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Firebase Setup

Firebase config is currently defined directly in:

```txt
src/services/firebase.js
```

To use live mode:

1. Create a Firebase project
2. Enable `Authentication > Sign-in method > Email/Password`
3. Create a Firestore database
4. Publish security rules
5. Confirm the config in `src/services/firebase.js`

### Suggested Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /trades/{tradeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /stats/{statId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Notes and Tradeoffs

- Firebase config is still committed directly in `src/services/firebase.js`
- moving config to `.env` would be a better production setup
- the current AI Insight section is rule-based, not backed by an LLM
- screenshot upload support exists in the service layer, but is not yet surfaced in the main UI
- there is a demo-first path in the product so UX work can continue even when backend setup is incomplete

## Verification

The project has been verified with:

```bash
npm run lint
npm run build
```

## GitHub Pages And Hostinger Domain

This repo is now structured for GitHub Pages deployment through GitHub Actions.

### What Is Included

- Vite is configured with relative asset paths in [vite.config.js](/C:/Users/Nattaphon.nk/Documents/Trading-Journal-main/vite.config.js:1)
- GitHub Pages workflow is included at [.github/workflows/deploy-pages.yml](/C:/Users/Nattaphon.nk/Documents/Trading-Journal-main/.github/workflows/deploy-pages.yml:1)
- The workflow builds the app from `master` and publishes `dist`
- If you add a repository variable named `CUSTOM_DOMAIN`, the workflow writes a `CNAME` file automatically

### GitHub Setup

1. Push this repository to GitHub.
2. Open the repository on GitHub and go to `Settings -> Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Open `Settings -> Secrets and variables -> Actions -> Variables`.
5. Add a repository variable named `CUSTOM_DOMAIN` with your real domain, for example `journal.yourdomain.com` or `yourdomain.com`.
6. Push any new commit to `master` to trigger deployment.

### Hostinger DNS Setup

For a subdomain like `journal.yourdomain.com`:

- Add a `CNAME` record for `journal` pointing to `bpocsts.github.io`

For an apex domain like `yourdomain.com`:

- Add `A` records pointing to `185.199.108.153`
- Add `A` records pointing to `185.199.109.153`
- Add `A` records pointing to `185.199.110.153`
- Add `A` records pointing to `185.199.111.153`
- Add a `CNAME` record for `www` pointing to `bpocsts.github.io`

### Final GitHub Domain Step

After DNS is added in Hostinger:

1. Go back to `Settings -> Pages` on GitHub.
2. Enter the same custom domain there.
3. Wait for DNS verification and then enable `HTTPS`.

GitHub's current guidance for custom domains and GitHub Pages is in the official docs:

- [About custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages?apiVersion=2022-11-28)
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site?apiVersion=2022-11-28&platform=windows)
- [Vite static deploy guide](https://vite.dev/guide/static-deploy.html)

## Roadmap Ideas

- move Firebase config to environment variables
- add better chart interaction and date-range filters
- support screenshot uploads in the UI
- add richer trade history filters
- expand AI insights beyond rule-based heuristics
- improve mobile navigation patterns further

## Status

Working prototype with:

- Firebase auth
- Firestore-backed trades
- bilingual UI
- responsive layout
- demo mode
- dashboard analytics
- trade history and deletion

---

If you're using this repo as a base for a personal journal or prop-firm review tool, the current architecture is a good foundation for adding stricter stats, richer charts, and deeper behavior analytics.
