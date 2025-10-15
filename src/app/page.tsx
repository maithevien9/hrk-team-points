import DashboardClient from '@/components/DashboardClient';

// Force dynamic rendering to avoid build-time fetch issues
export const dynamic = 'force-dynamic';

async function fetchAthletesDataServer() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/athletes`, {
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
