import { NextRequest, NextResponse } from 'next/server';
import { uploadAsset } from '@/lib/storage';
import { StorageProviderType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, fileName, fileBase64, provider, storageConfig } = body;

    if (!storeId || !fileName || !fileBase64) {
      return NextResponse.json({ success: false, error: 'Missing required file payload' }, { status: 400 });
    }

    const result = await uploadAsset(
      storeId,
      fileName,
      fileBase64,
      (provider as StorageProviderType) || 'LOCAL',
      storageConfig
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: result.url, provider: result.provider });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
