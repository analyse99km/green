export type StoreCategory = 'RETAIL' | 'HOSPITALITY' | 'DIGITAL' | 'SERVICES';

export type DeliveryType = 'LOCAL' | 'GLOBAL' | 'BOTH';

export type StorageProviderType =
  | 'LOCAL'
  | 'GITHUB'
  | 'AWS_S3'
  | 'AZURE_BLOB'
  | 'GCP_STORAGE'
  | 'ORACLE_OCI'
  | 'IBM_COS'
  | 'DIGITALOCEAN_SPACES'
  | 'CLOUDFLARE_R2'
  | 'VERCEL_BLOB';

export type PaymentMethodType = 'QR_UPI' | 'CRYPTO' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | 'NATIVE_CRYPTO';

export type OrderStatus = 
  | 'AWAITING_SELLER_CONFIRMATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface StorageConfig {
  githubRepo?: string; // owner/repo
  githubBranch?: string; // e.g. main
  githubToken?: string; // only passed in live requests, NEVER persisted for GitHub stores
  // S3 & S3-compatible (AWS, Cloudflare R2, DigitalOcean Spaces, Oracle OCI, IBM COS)
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  region?: string;
  endpoint?: string;
  // Microsoft Azure Blob
  azureAccountName?: string;
  azureContainerName?: string;
  azureSasToken?: string;
  // Google Cloud Storage
  gcpProjectId?: string;
  gcpBucket?: string;
  gcpAccessToken?: string;
  // Vercel Blob
  vercelBlobToken?: string;
}

export interface PaymentConfig {
  qrCodeUrl?: string;
  upiId?: string;
  cryptoAddresses?: {
    btc?: string;
    eth?: string;
    solana?: string;
    usdt?: string;
    green?: string; // native coin
  };
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscOrRouting?: string;
  };
  customInstructions?: string;
}

export interface ThemeConfig {
  primaryColor: string; // hex or color preset (emerald, violet, ocean, amber, rose, midnight)
  accentColor: string;
  layout: 'standard' | 'minimal' | 'cards' | 'grid';
  announcementText?: string;
  bannerHeadline?: string;
  bannerSubheadline?: string;
}

export interface Store {
  id: string;
  storeNumber: number; // 1, 2, 3... (Formatted as Store #01, Store #02)
  slug: string;
  name: string;
  ownerName: string; // Mandatory seller verification field
  ownerEmail?: string; // Mandatory seller contact email
  phoneNumber: string; // Mandatory seller phone number
  description: string;
  category: StoreCategory;
  logoUrl?: string;
  bannerUrl?: string;
  
  // Location & Delivery
  latitude: number;
  longitude: number;
  address: string;
  allowSelfPickup: boolean;
  deliveryType: DeliveryType;
  deliveryRadiusKm: number;
  
  // Customization & Dev Mode
  themeConfig: ThemeConfig;
  customCss?: string;
  customJs?: string;
  
  // Storage & Payments
  storageProvider: StorageProviderType;
  storageConfig?: StorageConfig;
  paymentConfig: PaymentConfig;
  paymentConfigLocked?: boolean;

  // Seller Authentication & Private GitHub Vault
  sellerId?: string;
  sellerPasswordHash?: string;
  githubVaultRepo?: string; // Private GitHub repo storing credentials & read-only payment config
  
  // Verification & Governance
  govtIdProofUrl?: string;
  shopOwnershipProofUrl?: string;
  isVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  
  createdAt: string;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number; // In base currency USD
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number; // Base selling price (in base currency, e.g. USD)
  originalPrice?: number; // Slashed fake/original price (promotional urgency)
  currency: string;
  images: string[];
  inventory: number; // Real inventory count
  customDeliveryRadiusKm?: number; // Per-product custom delivery distance
  allowCod?: boolean; // Seller can enable Cash on Delivery for this product
  addons?: ProductAddon[]; // Optional add-ons buyers can select
  
  // Promotional & Marketing Urgency Engine
  fakeStockAlarm?: number; // e.g. "Only 3 left in stock!"
  saleCountdownEndsAt?: string; // ISO date string for running flash sale timer
  
  isFamousDish?: boolean; // Hospitality badge (Chef's Special / Famous)
  tags: string[];
  isArchived: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedAddons?: ProductAddon[];
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  buyerName: string;
  buyerContact: string; // phone or email
  deliveryAddress?: string;
  deliveryType: 'DELIVERY' | 'SELF_PICKUP';
  shippingStatusText: string; // "Platform Delivery Network - Coming Soon 🔒 (Seller Self-Delivery)"
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  
  paymentMethod: PaymentMethodType;
  transactionId?: string; // Buyer-submitted TxID / Reference ID
  proofUrl?: string;
  status: OrderStatus;
  sellerNote?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  storeId: string;
  customerName: string;
  customerContact: string;
  guestCount: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:MM
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}

