import { AthleteData } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

const TEAM_SLUGS = [
  'hkr-team-1-2025-v2',
  'hkr-team-2-2025-v2',
  'hkr-team-3-2025-v2',
  'hkr-team-4-2025-v2',
  'hkr-team-5-2025-v2',
  'hkr-team-6-2025-v2',
];

const API_BASE_URL = 'https://nghienchaybo.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamSlug = searchParams.get('team_slug');

    // Set CORS headers for the response
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers: corsHeaders });
    }

    if (teamSlug) {
      // Fetch data for a specific team
      const url = `${API_BASE_URL}/api/event/athlete/goat-of-hkrers-hanh-trinh-tim-kiem-doi-huyen-thoai-trong-cong-dong-hkrers?limit=1000&offset=0&team_slug=${teamSlug}`;

      console.log(`Fetching team data for: ${teamSlug}`);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; HKRS-Dashboard/1.0)',
          'Cache-Control': 'no-cache',
        },
        // Remove next.js caching during development to avoid issues
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`External API error for ${teamSlug}: ${response.status} ${response.statusText}`);
        throw new Error(`External API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json(data, { headers: corsHeaders });
    } else {
      // Fetch data for all teams
      console.log('Fetching data for all teams');

      const apiPromises = TEAM_SLUGS.map(async (slug) => {
        const url = `${API_BASE_URL}/api/event/athlete/goat-of-hkrers-hanh-trinh-tim-kiem-doi-huyen-thoai-trong-cong-dong-hkrers?limit=1000&offset=0&team_slug=${slug}`;

        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; HKRS-Dashboard/1.0)',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error(`External API error for ${slug}: ${response.status} ${response.statusText}`);
          throw new Error(`External API error for ${slug}: ${response.status} - ${response.statusText}`);
        }

        return response.json();
      });

      const responses = await Promise.all(apiPromises);

      // Combine all athlete data from all responses
      const allAthletes: AthleteData[] = [];
      let totalCount = 0;

      responses.forEach((response) => {
        const data = response.data;
        allAthletes.push(...data.athletes);
        totalCount += data.count;
      });

      console.log(`Successfully fetched ${allAthletes.length} athletes from ${responses.length} teams`);

      // Return combined response
      return NextResponse.json(
        {
          data: {
            count: totalCount,
            limit: 1000,
            offset: 0,
            athletes: allAthletes,
          },
        },
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('API route error:', error);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(
      {
        error: 'Failed to fetch athlete data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
