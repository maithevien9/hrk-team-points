import Link from 'next/link';
import TeamDetail from '@/components/TeamDetail';

interface PageProps {
  params: {
    teamSlug: string;
  };
}

async function fetchTeamDataServer(teamSlug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/athletes?team_slug=${teamSlug}`, {
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
      throw new Error(data.message || 'Failed to fetch team data');
    }

    return data;
  } catch (error) {
    console.error('Error fetching team data:', error);
    throw error;
  }
}

export default async function TeamPage({ params }: PageProps) {
  const { teamSlug } = params;

  try {
    const data = await fetchTeamDataServer(teamSlug);

    return <TeamDetail athletes={data.data.athletes} teamSlug={teamSlug} />;
  } catch (error) {
    console.error('Error fetching team data:', error);
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>Error Loading Team Data</h1>
          <p className='text-gray-600 mb-6'>Unable to fetch data. Please try again later.</p>
          <Link href='/' className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
