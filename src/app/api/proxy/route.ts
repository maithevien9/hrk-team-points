import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiUrl = searchParams.get('url');

    if (!apiUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(apiUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Optional: Add URL validation to prevent abuse
    // You might want to restrict to specific domains for security
    const allowedDomains = [
      'nghienchaybo.com',
      // Add other allowed domains here
    ];

    const urlObj = new URL(apiUrl);
    const isAllowedDomain = allowedDomains.some((domain) => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));

    if (!isAllowedDomain) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    console.log(`Proxying request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; HKRS-Dashboard/1.0)',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: `External API error: ${response.status} - ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy route error:', error);

    return NextResponse.json(
      {
        error: 'Failed to proxy request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
