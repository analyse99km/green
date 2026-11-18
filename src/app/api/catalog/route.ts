import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json');

export async function GET() {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return NextResponse.json({ success: true, catalog: data });
    }
  } catch (err) {
    console.error('Failed to read catalog.json:', err);
  }

  return NextResponse.json({ success: true, catalog: null });
}
