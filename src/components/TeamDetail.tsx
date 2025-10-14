'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { AthleteData } from '@/lib/types';

interface TeamDetailProps {
  athletes: AthleteData[];
  teamSlug: string;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ athletes, teamSlug }) => {
  const router = useRouter();

  const teamAthletes = useMemo(() => {
    if (!teamSlug) return [];
    return athletes.filter((athlete) => athlete.athlete.team.slug === teamSlug);
  }, [athletes, teamSlug]);

  const teamName = teamAthletes[0]?.athlete.team.name || teamSlug;

  // Calculate member statistics
  const memberStats = useMemo(() => {
    return teamAthletes
      .map((athleteData) => {
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
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teamAthletes]);

  // Activity type distribution
  const activityTypeStats = useMemo(() => {
    const typeCounts: { [key: string]: number } = {};
    teamAthletes.forEach((athleteData) => {
      athleteData.athlete.activities.forEach((activity) => {
        typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
      });
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [teamAthletes]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

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
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Activity Type Distribution</h2>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Member Details Table */}
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='p-6 border-b'>
            <h2 className='text-2xl font-bold text-gray-800'>Member Details</h2>
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
