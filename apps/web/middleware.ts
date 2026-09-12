import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // If request arrives at profile.docwyrm.com, rewrite internal path to /profile
  if (hostname.startsWith('profile.') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
    url.pathname = '/profile';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
