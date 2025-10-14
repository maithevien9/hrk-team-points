'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onTeamSelect: (teamSlug: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onTeamSelect }) => {
  const router = useRouter();

  const teams = [
    { slug: 'hkr-team-1-2025-v2', name: 'Team 1' },
    { slug: 'hkr-team-2-2025-v2', name: 'Team 2' },
    { slug: 'hkr-team-3-2025-v2', name: 'Team 3' },
    { slug: 'hkr-team-4-2025-v2', name: 'Team 4' },
    { slug: 'hkr-team-5-2025-v2', name: 'Team 5' },
    { slug: 'hkr-team-6-2025-v2', name: 'Team 6' },
  ];

  const handleTeamClick = (teamSlug: string) => {
    onTeamSelect(teamSlug);
    router.push(`/team/${teamSlug}`);
  };

  return (
    <div className='fixed left-0 top-0 w-80 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-800'>Teams</h2>
      </div>

      <div className='space-y-3'>
        {teams.map((team) => (
          <div
            key={team.slug}
            onClick={() => handleTeamClick(team.slug)}
            className='p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
          >
            <h3 className='text-lg font-semibold text-gray-800 mb-1'>{team.name}</h3>
            <p className='text-sm text-gray-600'>{team.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
