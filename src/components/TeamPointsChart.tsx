'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TeamData } from '@/lib/types';

interface TeamPointsChartProps {
  data: TeamData[];
  loading: boolean;
  error: string | null;
}

const TeamPointsChart: React.FC<TeamPointsChartProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-lg'>Loading team data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-lg text-red-600'>Error: {error}</p>
      </div>
    );
  }

  // Sort data by total points in descending order
  const sortedData = [...data].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className='w-full h-96 p-4'>
      <h2 className='text-2xl font-bold text-center mb-4 text-gray-800'>Team Points Chart</h2>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={sortedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 100,
          }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='teamName' angle={-45} textAnchor='end' height={100} fontSize={12} />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value} points`, 'Total Points']}
            labelFormatter={(label: string) => `Team: ${label}`}
          />
          <Bar dataKey='totalPoints' fill='#8884d8' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamPointsChart;
