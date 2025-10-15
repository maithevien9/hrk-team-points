import DashboardClient from '@/components/DashboardClient';
import { headers } from 'next/headers';

// Force dynamic rendering to avoid build-time fetch issues
export const dynamic = 'force-dynamic';

async function fetchAthletesDataServer() {
  try {
    // Get the current request headers to construct the full URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/athletes`, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || 'Failed to fetch athletes data');
    }

    return data;
  } catch (error) {
    console.error('Error fetching athletes data:', error);
    throw error;
  }
}

export default async function Home() {
  try {
    const response = await fetchAthletesDataServer();

    return <DashboardClient initialData={response.data.athletes} />;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return <DashboardClient initialData={[]} error='Failed to load dashboard data' />;
  }
}
