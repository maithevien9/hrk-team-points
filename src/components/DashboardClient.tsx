'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TeamPointsChart from '@/components/TeamPointsChart';
import { processTeamPoints } from '@/lib/api';
import type { AthleteData } from '@/lib/types';

interface DashboardClientProps {
  initialData: AthleteData[];
  error?: string;
}

export default function DashboardClient({ initialData, error }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Process team data based on current filters
  const teamData = useMemo(() => {
    if (!initialData.length) return [];

    let filteredAthletes = initialData;

    if (selectedDate) {
      filteredAthletes = initialData
        .map((athleteData) => ({
          ...athleteData,
          athlete: {
            ...athleteData.athlete,
            activities: athleteData.athlete.activities.filter((activity) => {
              const activityDate = new Date(activity.start_date_local).toISOString().split('T')[0];
              return activityDate === selectedDate;
            }),
            total_point: athleteData.athlete.activities
              .filter((activity) => {
                const activityDate = new Date(activity.start_date_local).toISOString().split('T')[0];
                return activityDate === selectedDate;
              })
              .reduce((sum, activity) => sum + activity.point, 0),
          },
        }))
        .filter((athleteData) => athleteData.athlete.activities.length > 0);
    }

    return processTeamPoints(filteredAthletes);
  }, [initialData, selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  const clearFilter = () => {
    setSelectedDate('');
  };

  const loading = false; // Data is already loaded server-side

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50'>
      {/* Sidebar */}
      <Sidebar onTeamSelect={() => {}} />

      {/* Main Content */}
      <div className='ml-80 p-6'>
        {/* Header */}
        <header className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>HKRS Team Points Dashboard</h1>
          <p className='text-lg text-gray-600 mb-6'>Visualizing team performance from athlete data</p>

          {!loading && initialData.length > 0 && (
            <div className='flex justify-center items-center gap-4 mb-6 flex-wrap'>
              <div className='flex flex-col items-center gap-2'>
                <label htmlFor='date-filter' className='text-sm font-medium text-gray-700'>
                  Filter by Activity Date:
                </label>
                <select
                  id='date-filter'
                  value={selectedDate}
                  onChange={handleDateChange}
                  className='px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48'
                >
                  <option value=''>All Dates</option>
                  <option value='2025-10-13'>2025-10-13 (Monday)</option>
                  <option value='2025-10-14'>2025-10-14 (Tuesday)</option>
                  <option value='2025-10-15'>2025-10-15 (Wednesday)</option>
                  <option value='2025-10-16'>2025-10-16 (Thursday)</option>
                  <option value='2025-10-17'>2025-10-17 (Friday)</option>
                  <option value='2025-10-18'>2025-10-18 (Saturday)</option>
                  <option value='2025-10-19'>2025-10-19 (Sunday)</option>
                  <option value='2025-10-20'>2025-10-20 (Monday)</option>
                </select>
              </div>

              {selectedDate && (
                <button onClick={clearFilter} className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
                  Show All Dates
                </button>
              )}
            </div>
          )}

          {selectedDate && (
            <p className='text-blue-600 font-medium'>
              Showing activities from:{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{error}</div>}
        </header>

        {/* Chart */}
        <div className='mb-8'>
          <TeamPointsChart data={teamData} loading={loading} error={error || null} />
        </div>

        {/* Team Summary Cards */}
        {teamData.length > 0 && !loading && (
          <div className='mb-8'>
            <h3 className='text-2xl font-bold text-center mb-6 text-gray-800'>Team Summary</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {teamData
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((team) => (
                  <div key={team.teamSlug} className='bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow'>
                    <h4 className='text-xl font-semibold text-gray-800 mb-2'>{team.teamName}</h4>
                    <p className='text-3xl font-bold text-blue-600'>{team.totalPoints} points</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className='text-center mt-12 pt-8 border-t border-gray-200'>
          <p className='text-gray-600'>Data sourced from HKRS Event API</p>
        </footer>
      </div>
    </div>
  );
}
