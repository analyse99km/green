# 🌃 Neon Metropolis

> **Decentralized Cyberpunk Underworld RPG, Botanical Card Tap Generator, & P2P Syndicate Strategy**

[![Workflow](https://img.shields.io/badge/Workflow-Neon%20Cluster-00ff66.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black.svg)](https://nextjs.org/)
[![P2P Protocol](https://img.shields.io/badge/P2P-Serverless%20Mesh-green.svg)](#)

---

## 🌟 Overview

**Neon Metropolis** is a standalone, serverless cyberpunk underworld RPG and lucid botanical tapper powered by the `🌿 GREEN` in-game token. 

Players enter the underworld as Operatives, executing high-stakes crimes (Search, Shoplift, Pickpocket, Arson, Burglary), managing gym stat training, forging cybernetic gear, trading across a peer-to-peer decentralized bazaar mesh, and cultivating botanical dream cards.

---

## 🎮 Key Features

- **Direct In-Card Feedback**: Instant result banners directly below clicked action buttons across Crimes 2.0, Gym workouts, Items & Cyber Forge, Botanical upgrades, and Bazaar trades.
- **P2P Decentralized Bazaar Mesh**: Multi-user, cross-tab, and serverless peer trading powered by local storage and cryptographic consensus receipts (`neon_metropolis_p2p_bazaar_mesh`).
- **Autonomous Operative Security**: Email and codename authentication with salt/PBKDF2 key derivation and encrypted data vault.
- **Dynamic Risk & Legal System**: Shoplifting and theft fines scaled directly to item values (50% value fines) with level-scaled jail sentences and bail mechanics.
- **Botanical Cards & Dream Tap**: Botanical cards with passive GREEN yield generation, lucid dream tap multipliers, and airdrop score tracking.
- **Continuous 24/7 Cluster Pipeline**: Automated GitHub Actions autonomous cluster (`neon.yml`) with Cloudflare tunnel establishment and state synchronization.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/pocomon9/neon.git
cd neon

# Install dependencies
npm ci

# Start local dev server
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📦 Production Build

```bash
# Build production bundle
npm run build

# Start production server on port 8080
npx next start -p 8080
```

---

## ⚙️ Autonomous CI/CD Pipeline

The application features an automated 24/7 lifecycle runner defined in `.github/workflows/neon.yml`:
- Synchronizes persistent state across node slots.
- Boots Next.js on port 3000.
- Establishes a zero-config Cloudflare public tunnel.
- Writes live health and URLs to `status.json`.
- Triggers continuous rolling rebirth on `neon-start`.

---

## 🛡️ License

MIT License. Built for the decentralized underworld.
