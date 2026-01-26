
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This middleware can be used for additional server-side route protection
  // For client-side protection, we're using useEffect in the dashboard page
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};