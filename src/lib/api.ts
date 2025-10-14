import type { AthleteData } from './types';

export const processTeamPoints = (athletes: AthleteData[]) => {
  const teamPoints: { [key: string]: { totalPoints: number; teamName: string } } = {};

  athletes.forEach(({ athlete }) => {
    const teamSlug = athlete.team.slug;
    const teamName = athlete.team.name;

    if (!teamPoints[teamSlug]) {
      teamPoints[teamSlug] = { totalPoints: 0, teamName };
    }

    teamPoints[teamSlug].totalPoints += athlete.total_point;
  });

  return Object.entries(teamPoints).map(([slug, data]) => ({
    teamSlug: slug,
    teamName: data.teamName,
    totalPoints: data.totalPoints,
  }));
};
