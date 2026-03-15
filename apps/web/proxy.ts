import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Next.js 16+ request interception entrypoint (replaces middleware.ts naming).
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}
