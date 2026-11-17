import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // If user hosts their static manifest on GitHub raw, S3, or a personal static website:
    const remoteUrl = process.env.NEXT_PUBLIC_CLOUD_CATALOG_URL || process.env.CLOUD_CATALOG_URL;
    if (remoteUrl) {
      try {
        const remoteRes = await fetch(remoteUrl, { next: { revalidate: 60 } });
        if (remoteRes.ok) {
          const remoteJson = await remoteRes.json();
          return NextResponse.json({ success: true, source: 'remote_cloud', ...remoteJson });
        }
      } catch (e) {
        console.warn('Failed to fetch remote cloud manifest, falling back to local static catalog:', e);
      }
    }

    // Default to local static catalog
    const catalogPath = path.join(process.cwd(), 'public', 'cloud-catalog.json');
    if (!fs.existsSync(catalogPath)) {
      return NextResponse.json({ success: false, items: [] });
    }
    const data = fs.readFileSync(catalogPath, 'utf-8');
    const catalog = JSON.parse(data);
    return NextResponse.json({ success: true, source: 'local_static', ...catalog });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const catalogPath = path.join(process.cwd(), 'public', 'cloud-catalog.json');
    let catalog = { version: '2.5.0', updatedAt: new Date().toISOString(), items: [] as any[] };

    if (fs.existsSync(catalogPath)) {
      catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    }

    if (body.item) {
      catalog.items.push({
        ...body.item,
        isCloudItem: true,
        cloudVersion: catalog.version,
      });
      catalog.updatedAt = new Date().toISOString();
      fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
    }

    return NextResponse.json({ success: true, catalog });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
