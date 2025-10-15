'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import type { AthleteData } from '@/lib/types';

interface TeamDetailProps {
  athletes: AthleteData[];
  teamSlug: string;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ athletes, teamSlug }) => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'points' | 'activities' | 'km' | 'pace'>('points');
  const [selectedAthleteIndex, setSelectedAthleteIndex] = useState(0);

  const teamAthletes = useMemo(() => {
    if (!teamSlug) return [];
    return athletes.filter((athlete) => athlete.athlete.team.slug === teamSlug);
  }, [athletes, teamSlug]);

  const teamName = teamAthletes[0]?.athlete.team.name || teamSlug;

  // Calculate member statistics
  const memberStats = useMemo(() => {
    const stats = teamAthletes.map((athleteData) => {
      const { athlete } = athleteData;
      const totalActivities = athlete.activities.length;
      const totalKm = athlete.activities.reduce((sum, activity) => sum + activity.km, 0);
      const avgPace =
        athlete.activities.length > 0
          ? athlete.activities.reduce((sum, activity) => sum + activity.avg_pace, 0) / athlete.activities.length
          : 0;

      return {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`,
        totalPoints: athlete.total_point,
        totalActivities,
        totalKm: Math.round(totalKm * 10) / 10,
        avgPace: Math.round(avgPace * 10) / 10,
        profile: athlete.profile,
        sex: athlete.sex,
        athleteData, // Keep reference to original data
      };
    });

    // Sort based on selected criteria
    return stats.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.totalPoints - a.totalPoints;
        case 'activities':
          return b.totalActivities - a.totalActivities;
        case 'km':
          return b.totalKm - a.totalKm;
        case 'pace':
          return a.avgPace - b.avgPace; // Lower pace is better
        default:
          return b.totalPoints - a.totalPoints;
      }
    });
  }, [teamAthletes, sortBy]);

  // Selected athlete based on index
  const selectedAthlete = memberStats[selectedAthleteIndex]?.athleteData || null;

  // Activity type distribution (summed by points)
  const activityTypeStats = useMemo(() => {
    const typePoints: { [key: string]: number } = {};
    teamAthletes.forEach((athleteData) => {
      athleteData.athlete.activities.forEach((activity) => {
        typePoints[activity.type] = (typePoints[activity.type] || 0) + activity.point;
      });
    });

    return Object.entries(typePoints)
      .map(([type, points]) => ({
        name: type,
        value: Math.round(points * 100) / 100, // Round to 2 decimal places
      }))
      .sort((a, b) => b.value - a.value); // Sort by points descending
  }, [teamAthletes]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  // Athlete detail calculations
  const selectedAthleteStats = useMemo(() => {
    if (!selectedAthlete) return null;

    const athlete = selectedAthlete.athlete;
    const activitiesByDate = athlete.activities.reduce((acc, activity) => {
      const date = new Date(activity.start_date_local).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {} as { [key: string]: typeof athlete.activities });

    const dailyStats = Object.entries(activitiesByDate)
      .map(([date, activities]) => ({
        date,
        totalPoints: activities.reduce((sum, a) => sum + a.point, 0),
        totalKm: activities.reduce((sum, a) => sum + a.km, 0),
        activityCount: activities.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const activityTypeBreakdown = athlete.activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + activity.point;
      return acc;
    }, {} as { [key: string]: number });

    return {
      athlete,
      dailyStats,
      activityTypeBreakdown: Object.entries(activityTypeBreakdown).map(([type, points]) => ({
        name: type,
        value: Math.round(points * 100) / 100,
      })),
    };
  }, [selectedAthlete]);

  if (teamAthletes.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-xl mb-4'>No data found for this team.</p>
          <button onClick={() => router.back()} className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-gray-800 mb-2'>{teamName}</h1>
            <p className='text-lg text-gray-600'>
              Team Analysis • {memberStats.length} Members • {memberStats.reduce((sum, member) => sum + member.totalActivities, 0)} Total
              Activities
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Team Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>{memberStats.length}</div>
            <div className='text-gray-600'>Team Members</div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>{memberStats.reduce((sum, member) => sum + member.totalPoints, 0)}</div>
            <div className='text-gray-600'>Total Points</div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              {memberStats.reduce((sum, member) => sum + member.totalActivities, 0)}
            </div>
            <div className='text-gray-600'>Total Activities</div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              {Math.round(memberStats.reduce((sum, member) => sum + member.totalKm, 0))}
            </div>
            <div className='text-gray-600'>Total KM</div>
          </div>
        </div>

        {/* Member Statistics Chart */}
        <div className='bg-white p-6 rounded-xl shadow-lg mb-8'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>Member Points Comparison</h2>
          <div className='h-96'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={memberStats}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' angle={-45} textAnchor='end' height={100} fontSize={12} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} points`, 'Total Points']}
                  labelFormatter={(label: string) => `Member: ${label}`}
                />
                <Bar dataKey='totalPoints' fill='#8884d8' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Type Distribution */}
        {activityTypeStats.length > 0 && (
          <div className='bg-white p-6 rounded-xl shadow-lg mb-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Activity Type Distribution (by Points)</h2>
            <div className='h-80 flex justify-center'>
              <ResponsiveContainer width='50%' height='100%'>
                <PieChart>
                  <Pie
                    data={activityTypeStats}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {activityTypeStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} points`, 'Total Points']}
                    labelFormatter={(label: string) => `Activity Type: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Athlete Details Section */}
        {selectedAthlete && selectedAthleteStats && (
          <div className='bg-white p-6 rounded-xl shadow-lg mb-8'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-800'>Athlete Details</h2>
              <div className='flex items-center gap-4'>
                <label htmlFor='athlete-select' className='text-sm font-medium text-gray-700'>
                  Select Athlete:
                </label>
                <select
                  id='athlete-select'
                  value={selectedAthleteIndex}
                  onChange={(e) => setSelectedAthleteIndex(Number(e.target.value))}
                  className='px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48'
                >
                  {memberStats.map((member, index) => (
                    <option key={member.id} value={index}>
                      {member.name} ({member.totalPoints} pts)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Athlete Header */}
            <div className='flex items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
              <img
                src={
                  selectedAthleteStats.athlete.profile.startsWith('http')
                    ? selectedAthleteStats.athlete.profile
                    : `https://via.placeholder.com/80x80?text=${selectedAthleteStats.athlete.firstname.charAt(0)}`
                }
                alt={selectedAthleteStats.athlete.firstname}
                className='w-20 h-20 rounded-full mr-6 object-cover'
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).src = `https://via.placeholder.com/80x80?text=${selectedAthleteStats.athlete.firstname.charAt(0)}`;
                }}
              />
              <div>
                <h3 className='text-2xl font-bold text-gray-800 mb-1'>
                  {selectedAthleteStats.athlete.firstname} {selectedAthleteStats.athlete.lastname}
                </h3>
                <p className='text-gray-600 mb-2'>
                  ID: {selectedAthleteStats.athlete.id} • {selectedAthleteStats.athlete.sex === 'M' ? 'Male' : 'Female'}
                </p>
                <div className='flex gap-4 text-sm'>
                  <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
                    {selectedAthleteStats.athlete.activities.length} Activities
                  </span>
                  <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full'>
                    {selectedAthleteStats.athlete.activities.reduce((sum, a) => sum + a.km, 0).toFixed(1)} km Total
                  </span>
                  <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full'>
                    {selectedAthleteStats.athlete.total_point} Points
                  </span>
                </div>
              </div>
            </div>

            {/* Athlete Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div className='bg-blue-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-blue-600'>{selectedAthleteStats.athlete.total_point}</div>
                <div className='text-sm text-blue-800'>Total Points</div>
              </div>
              <div className='bg-green-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-green-600'>{selectedAthleteStats.athlete.activities.length}</div>
                <div className='text-sm text-green-800'>Total Activities</div>
              </div>
              <div className='bg-purple-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {selectedAthleteStats.athlete.activities.reduce((sum, a) => sum + a.km, 0).toFixed(1)}
                </div>
                <div className='text-sm text-purple-800'>Total KM</div>
              </div>
              <div className='bg-orange-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-orange-600'>
                  {(
                    selectedAthleteStats.athlete.activities.reduce((sum, a) => sum + a.avg_pace, 0) /
                    selectedAthleteStats.athlete.activities.length
                  ).toFixed(1)}
                </div>
                <div className='text-sm text-orange-800'>Avg Pace (min/km)</div>
              </div>
            </div>

            {/* Activity Timeline Chart */}
            <div className='mb-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>Activity Timeline</h3>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={selectedAthleteStats.dailyStats}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        name === 'totalPoints' ? `${value} points` : name === 'totalKm' ? `${value} km` : value,
                        name === 'totalPoints' ? 'Points' : name === 'totalKm' ? 'Distance' : 'Activities',
                      ]}
                    />
                    <Line type='monotone' dataKey='totalPoints' stroke='#8884d8' strokeWidth={2} />
                    <Line type='monotone' dataKey='totalKm' stroke='#82ca9d' strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Type Breakdown */}
            {selectedAthleteStats.activityTypeBreakdown.length > 0 && (
              <div className='mb-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Activity Type Breakdown (by Points)</h3>
                <div className='h-64 flex justify-center'>
                  <ResponsiveContainer width='50%' height='100%'>
                    <PieChart>
                      <Pie
                        data={selectedAthleteStats.activityTypeBreakdown}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {selectedAthleteStats.activityTypeBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} points`, 'Total Points']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Activities Table */}
            <div>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>Recent Activities</h3>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                  <thead className='bg-gray-100'>
                    <tr>
                      <th className='px-4 py-2 text-left'>Date</th>
                      <th className='px-4 py-2 text-left'>Type</th>
                      <th className='px-4 py-2 text-center'>Distance (km)</th>
                      <th className='px-4 py-2 text-center'>Pace (min/km)</th>
                      <th className='px-4 py-2 text-center'>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAthleteStats.athlete.activities
                      .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime())
                      .slice(0, 20) // Show last 20 activities
                      .map((activity, index) => (
                        <tr key={activity.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className='px-4 py-2'>{new Date(activity.start_date_local).toLocaleDateString()}</td>
                          <td className='px-4 py-2'>{activity.type}</td>
                          <td className='px-4 py-2 text-center'>{activity.km.toFixed(2)}</td>
                          <td className='px-4 py-2 text-center'>{activity.avg_pace.toFixed(1)}</td>
                          <td className='px-4 py-2 text-center font-semibold text-blue-600'>{activity.point}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Member Details Table */}
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='p-6 border-b'>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-bold text-gray-800'>Member Details</h2>
              <div className='flex items-center gap-4'>
                <label htmlFor='sort-select' className='text-sm font-medium text-gray-700'>
                  Sort by:
                </label>
                <select
                  id='sort-select'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className='px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='points'>Total Points</option>
                  <option value='activities'>Activity Count</option>
                  <option value='km'>Total KM</option>
                  <option value='pace'>Avg Pace</option>
                </select>
              </div>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-blue-600 text-white'>
                <tr>
                  <th className='px-6 py-4 text-left'>Member</th>
                  <th className='px-6 py-4 text-center'>Total Points</th>
                  <th className='px-6 py-4 text-center'>Activities</th>
                  <th className='px-6 py-4 text-center'>Total KM</th>
                  <th className='px-6 py-4 text-center'>Avg Pace</th>
                  <th className='px-6 py-4 text-center'>Gender</th>
                </tr>
              </thead>
              <tbody>
                {memberStats.map((member, index) => (
                  <tr key={member.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <img
                          src={
                            member.profile.startsWith('http')
                              ? member.profile
                              : `https://via.placeholder.com/50x50?text=${member.name.charAt(0)}`
                          }
                          alt={member.name}
                          className='w-12 h-12 rounded-full mr-4 object-cover'
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/50x50?text=${member.name.charAt(0)}`;
                          }}
                        />
                        <div>
                          <div className='font-semibold text-gray-800'>{member.name}</div>
                          <div className='text-sm text-gray-600'>ID: {member.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span className='font-semibold text-blue-600'>{member.totalPoints}</span>
                    </td>
                    <td className='px-6 py-4 text-center'>{member.totalActivities}</td>
                    <td className='px-6 py-4 text-center'>{member.totalKm} km</td>
                    <td className='px-6 py-4 text-center'>{member.avgPace} min/km</td>
                    <td className='px-6 py-4 text-center'>{member.sex === 'M' ? 'Male' : 'Female'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
