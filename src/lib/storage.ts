import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { StorageConfig, StorageProviderType, PaymentConfig } from './types';

export interface UploadResult {
  success: boolean;
  url: string;
  provider: StorageProviderType;
  error?: string;
}

export interface AssetItem {
  name: string;
  url: string;
  provider: StorageProviderType;
}

const S3_COMPATIBLE_PROVIDERS: StorageProviderType[] = [
  'AWS_S3',
  'CLOUDFLARE_R2',
  'DIGITALOCEAN_SPACES',
  'ORACLE_OCI',
  'IBM_COS',
];

function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'json') return 'application/json';
  return 'image/jpeg';
}

/**
 * AWS Signature V4 S3-Compatible PUT Upload (AWS S3, Cloudflare R2, DigitalOcean Spaces, Oracle OCI, IBM COS)
 */
async function uploadToS3Compatible(
  storeId: string,
  safeFileName: string,
  buffer: Buffer,
  config: StorageConfig,
  provider: StorageProviderType
): Promise<UploadResult> {
  const { accessKeyId, secretAccessKey, bucket, region = 'us-east-1', endpoint } = config;
  if (!accessKeyId || !secretAccessKey || !bucket) {
    return {
      success: false,
      url: '',
      provider,
      error: `${provider} requires Access Key ID, Secret Access Key, and Bucket Name.`,
    };
  }

  try {
    const key = `store-assets/${storeId}/${safeFileName}`;
    const rawEndpoint = endpoint?.trim() || `https://${bucket}.s3.${region}.amazonaws.com`;
    const baseUrl = rawEndpoint.replace(/\/$/, '');
    const targetUrl = baseUrl.includes(bucket) ? `${baseUrl}/${key}` : `${baseUrl}/${bucket}/${key}`;
    const parsedUrl = new URL(targetUrl);

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const contentType = getContentType(safeFileName);

    const canonicalHeaders = `host:${parsedUrl.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n${parsedUrl.pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex')}`;

    const hmac = (k: Buffer | string, d: string) => crypto.createHmac('sha256', k).update(d).digest();
    const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, 's3');
    const kSigning = hmac(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        Host: parsedUrl.host,
        'Content-Type': contentType,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        Authorization: authorization,
      },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, url: '', provider, error: `${provider} upload error (${res.status}): ${errText}` };
    }

    return { success: true, url: targetUrl, provider };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, url: '', provider, error: message };
  }
}

/**
 * Handles uploading files to GitHub CDN, Cloud Providers (AWS, Azure, GCP, OCI, IBM, DO, R2, Vercel), or Local Disk
 */
export async function uploadAsset(
  storeId: string,
  fileName: string,
  fileBase64: string,
  provider: StorageProviderType,
  config?: StorageConfig
): Promise<UploadResult> {
  const cleanBase64 = fileBase64.replace(/^data:[\w/+.-]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const contentType = getContentType(safeFileName);

  // 1. GitHub Storage Provider (Strict Zero-Server-Storage)
  if (provider === 'GITHUB') {
    if (!config?.githubToken || !config?.githubRepo) {
      return {
        success: false,
        url: '',
        provider: 'GITHUB',
        error: 'GitHub Token and Repository are required for zero-server GitHub storage.',
      };
    }

    try {
      const branch = config.githubBranch || 'main';
      const repo = config.githubRepo.trim();
      const filePath = `store-assets/${storeId}/${safeFileName}`;
      const githubApiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

      const response = await fetch(githubApiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.githubToken.trim()}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GreenMarketplace-Decentralized-App',
        },
        body: JSON.stringify({
          message: `Upload store asset ${safeFileName} via Green Marketplace`,
          content: cleanBase64,
          branch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          url: '',
          provider: 'GITHUB',
          error: errorData.message || 'GitHub upload failed (no file saved on host server).',
        };
      }

      const cdnUrl = `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${filePath}`;
      return { success: true, url: cdnUrl, provider: 'GITHUB' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, url: '', provider: 'GITHUB', error: message };
    }
  }

  // 2. S3-Compatible Cloud Providers (AWS S3, Cloudflare R2, DigitalOcean Spaces, Oracle OCI, IBM COS)
  if (S3_COMPATIBLE_PROVIDERS.includes(provider)) {
    return uploadToS3Compatible(storeId, safeFileName, buffer, config || {}, provider);
  }

  // 3. Microsoft Azure Blob Storage
  if (provider === 'AZURE_BLOB') {
    const { azureAccountName, azureContainerName, azureSasToken } = config || {};
    if (!azureAccountName || !azureContainerName || !azureSasToken) {
      return { success: false, url: '', provider, error: 'Azure Account Name, Container, and SAS Token are required.' };
    }
    try {
      const sas = azureSasToken.startsWith('?') ? azureSasToken.slice(1) : azureSasToken;
      const blobUrl = `https://${azureAccountName}.blob.core.windows.net/${azureContainerName}/store-assets/${storeId}/${safeFileName}`;
      const res = await fetch(`${blobUrl}?${sas}`, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType },
        body: new Uint8Array(buffer),
      });
      if (!res.ok) {
        return { success: false, url: '', provider, error: `Azure upload error (${res.status})` };
      }
      return { success: true, url: blobUrl, provider };
    } catch (err: unknown) {
      return { success: false, url: '', provider, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // 4. Google Cloud Storage (GCP)
  if (provider === 'GCP_STORAGE') {
    const { gcpBucket, gcpAccessToken } = config || {};
    if (!gcpBucket || !gcpAccessToken) {
      return { success: false, url: '', provider, error: 'GCP Bucket Name and OAuth Access Token are required.' };
    }
    try {
      const objectName = encodeURIComponent(`store-assets/${storeId}/${safeFileName}`);
      const res = await fetch(
        `https://storage.googleapis.com/upload/storage/v1/b/${gcpBucket}/o?uploadType=media&name=${objectName}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${gcpAccessToken}`,
            'Content-Type': contentType,
          },
          body: new Uint8Array(buffer),
        }
      );
      if (!res.ok) {
        return { success: false, url: '', provider, error: `GCP upload error (${res.status})` };
      }
      const publicUrl = `https://storage.googleapis.com/${gcpBucket}/store-assets/${storeId}/${safeFileName}`;
      return { success: true, url: publicUrl, provider };
    } catch (err: unknown) {
      return { success: false, url: '', provider, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // 5. Vercel Blob Storage
  if (provider === 'VERCEL_BLOB') {
    const { vercelBlobToken } = config || {};
    if (!vercelBlobToken) {
      return { success: false, url: '', provider, error: 'Vercel Blob Read-Write Token is required.' };
    }
    try {
      const res = await fetch(`https://blob.vercel-storage.com/store-assets/${storeId}/${safeFileName}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${vercelBlobToken}`,
          'Content-Type': contentType,
          'x-api-version': '7',
        },
        body: new Uint8Array(buffer),
      });
      if (!res.ok) {
        return { success: false, url: '', provider, error: `Vercel Blob upload error (${res.status})` };
      }
      const data = await res.json();
      return { success: true, url: data.url, provider };
    } catch (err: unknown) {
      return { success: false, url: '', provider, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // 6. Local Storage Provider (Self-Hosted on Server)
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', storeId);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${storeId}/${safeFileName}`;
    return { success: true, url: publicUrl, provider: 'LOCAL' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, url: '', provider: 'LOCAL', error: message };
  }
}

/**
 * Commits store JSON data (store.json, products.json, orders.json) directly into the seller's GitHub repo
 * so zero store text/media needs to be persisted on the host server.
 */
export async function syncStoreDataToGitHub(
  token: string,
  repo: string,
  branch: string,
  slug: string,
  fileName: 'store.json' | 'products.json' | 'orders.json' | 'reservations.json',
  jsonData: unknown
): Promise<{ ok: boolean; message: string }> {
  try {
    const cleanToken = token.trim();
    const filePath = `store-data/${slug}/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${repo.trim()}/contents/${filePath}`;

    let sha: string | undefined;
    const existing = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });
    if (existing.ok) {
      const existingData = await existing.json();
      sha = existingData.sha;
    }

    const content = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
      body: JSON.stringify({
        message: `Sync ${fileName} for store ${slug}`,
        content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { ok: false, message: err.message || `Failed to sync ${fileName}` };
    }
    return { ok: true, message: `Synced ${fileName} to ${repo}` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Automatically creates the store folder in the seller's GitHub repository
 */
export async function initGitHubStoreFolder(
  storeId: string,
  storeName: string,
  config: StorageConfig
): Promise<{ ok: boolean; message: string; folderUrl?: string }> {
  if (!config.githubToken || !config.githubRepo) {
    return { ok: false, message: 'GitHub Token and Repository are required.' };
  }

  try {
    const ensured = await ensureGitHubRepo(config.githubToken, config.githubRepo);
    if (!ensured.ok) {
      return { ok: false, message: ensured.message };
    }

    const branch = config.githubBranch || 'main';
    const repo = ensured.resolvedRepo;
    const filePath = `store-assets/${storeId}/README.md`;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    const checkRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${config.githubToken.trim()}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });

    if (checkRes.ok) {
      return {
        ok: true,
        message: `Folder store-assets/${storeId}/ already exists in ${repo}!`,
        folderUrl: `https://github.com/${repo}/tree/${branch}/store-assets/${storeId}`,
      };
    }

    const readmeContent = Buffer.from(
      `# ${storeName} (${storeId})\n\nAutomated media & CDN asset folder managed by Green Marketplace.\n`
    ).toString('base64');

    const createRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.githubToken.trim()}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
      body: JSON.stringify({
        message: `Initialize store folder for ${storeName}`,
        content: readmeContent,
        branch,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return { ok: false, message: err.message || 'Failed to create GitHub folder.' };
    }

    return {
      ok: true,
      message: `Created folder store-assets/${storeId}/ in ${repo}!`,
      folderUrl: `https://github.com/${repo}/tree/${branch}/store-assets/${storeId}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `GitHub folder error: ${message}` };
  }
}

/**
 * Lists all uploaded image/asset CDN links for a store
 */
export async function listStoreAssets(
  storeId: string,
  provider: StorageProviderType,
  config?: StorageConfig
): Promise<AssetItem[]> {
  const assets: AssetItem[] = [];

  if (provider === 'GITHUB' && config?.githubRepo) {
    try {
      const branch = config.githubBranch || 'main';
      const repo = config.githubRepo.trim();
      const headers: Record<string, string> = { 'User-Agent': 'GreenMarketplace-Decentralized-App' };
      if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken.trim()}`;

      const res = await fetch(
        `https://api.github.com/repos/${repo}/contents/store-assets/${storeId}?ref=${branch}`,
        { headers }
      );
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.type === 'file' && item.name !== 'README.md') {
              assets.push({
                name: item.name,
                url: `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${item.path}`,
                provider: 'GITHUB',
              });
            }
          }
        }
      }
    } catch {}
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', storeId);
    const files = await fs.readdir(uploadDir);
    for (const file of files) {
      assets.push({
        name: file,
        url: `/uploads/${storeId}/${file}`,
        provider: 'LOCAL',
      });
    }
  } catch {}

  return assets;
}

/**
 * Resolves "username" -> "username/green-store-assets" or keeps "owner/repo",
 * and auto-creates the public repository if it doesn't exist yet.
 */
export async function ensureGitHubRepo(
  token: string,
  repoOrUsername: string
): Promise<{ ok: boolean; resolvedRepo: string; message: string }> {
  const cleanToken = token.trim();
  const raw = repoOrUsername.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });

    if (!userRes.ok) {
      const err = await userRes.json();
      return {
        ok: false,
        resolvedRepo: raw,
        message: `Invalid GitHub Token: ${err.message || 'Authentication failed'}`,
      };
    }

    const userData = await userRes.json();
    const owner = raw.includes('/') ? raw.split('/')[0] : (raw || userData.login);
    const repoName = raw.includes('/') ? raw.split('/')[1] : 'green-store-assets';
    const fullRepo = `${owner}/${repoName}`;

    const checkRes = await fetch(`https://api.github.com/repos/${fullRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });

    if (checkRes.ok) {
      const repoData = await checkRes.json();
      return {
        ok: true,
        resolvedRepo: repoData.full_name,
        message: `Connected to repository "${repoData.full_name}" successfully!`,
      };
    }

    if (owner.toLowerCase() === userData.login.toLowerCase()) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GreenMarketplace-Decentralized-App',
        },
        body: JSON.stringify({
          name: repoName,
          description: 'Automated media & CDN assets for Green Marketplace Store',
          private: false,
          auto_init: true,
        }),
      });

      if (createRes.ok) {
        const created = await createRes.json();
        return {
          ok: true,
          resolvedRepo: created.full_name,
          message: `Auto-created repository "${created.full_name}" & connected!`,
        };
      } else {
        const err = await createRes.json();
        return {
          ok: false,
          resolvedRepo: fullRepo,
          message: `Repo "${fullRepo}" not found and auto-create failed: ${err.message || 'Check token "repo" scope'}`,
        };
      }
    }

    return {
      ok: false,
      resolvedRepo: fullRepo,
      message: `Repository "${fullRepo}" not found. Enter "username/repo-name" or just your username "${userData.login}".`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, resolvedRepo: raw, message: `Connection error: ${message}` };
  }
}

export async function testGitHubAccess(
  token: string,
  repo: string
): Promise<{ ok: boolean; message: string; resolvedRepo?: string }> {
  const result = await ensureGitHubRepo(token, repo);
  return {
    ok: result.ok,
    message: result.message,
    resolvedRepo: result.resolvedRepo,
  };
}

export function hashSellerPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function verifyGitHubOwnerToken(
  token: string,
  repo: string
): Promise<{ ok: boolean; username?: string; message: string }> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo.trim()}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });
    if (!res.ok) {
      return { ok: false, message: 'GitHub token does not have access to this repository.' };
    }
    const data = await res.json();
    if (!data.permissions?.push && !data.permissions?.admin) {
      return { ok: false, message: 'Read-only: Owner PAT with write/push permission is required.' };
    }
    return { ok: true, username: data.owner?.login, message: 'Owner GitHub PAT verified.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message };
  }
}

export async function saveSellerVaultToGitHub(
  token: string,
  slug: string,
  sellerId: string,
  passwordHash: string,
  paymentConfig: PaymentConfig
): Promise<{ ok: boolean; vaultRepo?: string; message: string }> {
  const cleanToken = token.trim();
  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });
    if (!userRes.ok) {
      return { ok: false, message: 'Invalid GitHub PAT for private vault.' };
    }
    const userData = await userRes.json();
    const vaultName = 'green-seller-vault';
    const vaultRepo = `${userData.login}/${vaultName}`;

    const checkRes = await fetch(`https://api.github.com/repos/${vaultRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'User-Agent': 'GreenMarketplace-Decentralized-App',
      },
    });

    if (!checkRes.ok) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GreenMarketplace-Decentralized-App',
        },
        body: JSON.stringify({
          name: vaultName,
          description: 'Private Seller Credentials & Read-Only Payment Config Vault',
          private: true,
          auto_init: true,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        return { ok: false, message: `Failed to create private vault repo: ${err.message}` };
      }
    }

    const putFile = async (filePath: string, jsonObj: unknown, commitMsg: string) => {
      const apiUrl = `https://api.github.com/repos/${vaultRepo}/contents/${filePath}`;
      let sha: string | undefined;
      const existing = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'User-Agent': 'GreenMarketplace-Decentralized-App',
        },
      });
      if (existing.ok) {
        const existingData = await existing.json();
        sha = existingData.sha;
      }
      const content = Buffer.from(JSON.stringify(jsonObj, null, 2)).toString('base64');
      await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GreenMarketplace-Decentralized-App',
        },
        body: JSON.stringify({ message: commitMsg, content, ...(sha ? { sha } : {}) }),
      });
    };

    await putFile(
      `store-vault/${slug}/credentials.json`,
      { sellerId, passwordHash, slug, updatedAt: new Date().toISOString() },
      `Store seller credentials for ${slug}`
    );

    await putFile(
      `store-vault/${slug}/payment-config.json`,
      { ...paymentConfig, readOnly: true, updatedAt: new Date().toISOString() },
      `Save read-only payment config for ${slug}`
    );

    return { ok: true, vaultRepo, message: `Saved credentials & payment config to private repo ${vaultRepo}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message };
  }
}

export async function verifySellerGitHubVault(
  token: string,
  vaultRepo: string,
  slug: string,
  sellerId: string,
  password: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${vaultRepo}/contents/store-vault/${slug}/credentials.json`,
      {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'User-Agent': 'GreenMarketplace-Decentralized-App',
        },
      }
    );
    if (!res.ok) {
      return { ok: false, message: 'Could not read credentials from private GitHub vault. Check PAT.' };
    }
    const data = await res.json();
    const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
    if (decoded.sellerId === sellerId.trim() && decoded.passwordHash === hashSellerPassword(password)) {
      return { ok: true, message: 'Verified against private GitHub vault!' };
    }
    return { ok: false, message: 'Seller ID or Password does not match private GitHub vault.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message };
  }
}
