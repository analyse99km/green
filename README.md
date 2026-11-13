# GREEN | Self-Hosted Decentralized Marketplace (Pre-Release)

A modern, zero-commission, self-hosted marketplace web application where anyone can open an independent storefront, publish products, manage inventory, and settle orders directly peer-to-peer (P2P).

Built with **Next.js (App Router)**, **React**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Architecture & Capabilities

1. **Zero Text / Zero Media on Host Server (GitHub CDN & Vault Mode)**:
   - **Store Media**: Photos and assets are automatically pushed to the merchant's GitHub repository (`green-store-assets`) and delivered via global free jsDelivr CDN.
   - **Private Security Vault**: Credentials and read-only payment methods reside in the seller's private repository (`green-seller-vault`), verified in real-time with zero credentials stored on the marketplace server.
   - **Multi-Cloud Storage**: Seamless support for AWS S3 (SigV4), Azure Blob, Google Cloud Storage, Cloudflare R2, DigitalOcean Spaces, Oracle OCI, IBM COS, and Vercel Blob.

2. **Full Product & Inventory Control**:
   - Create, edit, and archive products.
   - Live price updates, original strikethrough pricing, and real-time inventory management.
   - Quick one-click stock increment/decrement directly from the seller table.
   - Customizable product add-ons (e.g. extra toppings, gift wrap).
   - Artificial urgency engine (FOMO stock countdown alarms and flash sale timers).
   - Per-product Cash on Delivery (COD) toggle.

3. **Hyperlocal Discovery & OpenStreetMap**:
   - Interactive Leaflet / OpenStreetMap discovery map with custom delivery perimeter circles.
   - Real browser GPS geocoding and Nominatim city search.
   - Filter by Local Delivery, Global Shipping, Hospitality & Dining, and Verified Storefronts.

4. **Direct P2P Checkout & Payment Verification**:
   - Zero platform transaction fees or middleman escrow.
   - Direct payment channels: Bank Wire / IBAN, TWINT / UPI QR Code, Direct Crypto Address, and Cash on Delivery.
   - Buyer submits transaction reference ID / proof; seller verifies directly in their bank/wallet and confirms the order.

5. **Multi-Currency Live Engine**:
   - Dynamic real-time exchange rates for CHF, USD, EUR, INR, GBP, JPY, AUD, CAD, BTC, ETH, and USDT.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.18+ or v20+
- **npm** or **pnpm** / **yarn**

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd green

# Install dependencies
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Marketplace Home**: `http://localhost:3000`
- **Create Store**: `http://localhost:3000/create-store`
- **Seller Dashboard**: `http://localhost:3000/dashboard`
- **Track Orders**: `http://localhost:3000/orders`

---

## 🏬 Creating Your First Store

1. Navigate to `/create-store`.
2. Enter your store name, owner name, contact email, and phone/WhatsApp.
3. Set your seller credentials (Seller ID and password).
4. Choose your storage provider:
   - **Local Disk**: Zero configuration.
   - **Free GitHub Repo CDN**: Enter your GitHub username and Personal Access Token (PAT with `repo` scope) to automatically provision public asset CDN and private auth vault.
   - **Cloud Storage**: AWS S3, Cloudflare R2, Azure Blob, or Google Cloud.
5. Set your location on the map and delivery perimeter.
6. Configure payment options (Bank details, Twint/QR code, Crypto address, COD).
7. Submit to launch your decentralized storefront!

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **UI Library**: React 19, Tailwind CSS v4, Lucide Icons
- **Mapping**: Leaflet & OpenStreetMap (SSR Dynamic)
- **Storage**: AWS Signature V4 REST, GitHub REST API, jsDelivr CDN
- **Database**: Local atomic JSON persistence (`data/database.json`), clean initialization with zero dummy stores
