export interface Activity {
  type: string;
  id: number;
  avg_pace: number;
  avg_speed: number;
  start_date_local: string;
  name: string;
  kudos_count: number;
  distance: number;
  km: number;
  block: number;
  point: number;
  kind_of_activity: string;
}

export interface Athlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  sex: string;
  strava_link: string;
  total_run_km: number;
  total_point: number;
  total_days: number;
  activities: Activity[];
  personal_level: string;
  team: {
    slug: string;
    name: string;
  };
}

export interface AthleteData {
  slug: string;
  event_id: string;
  from: number;
  to: number;
  athlete: Athlete;
}

export interface ApiResponse {
  data: {
    count: number;
    limit: number;
    offset: number;
    athletes: AthleteData[];
  };
}

export interface TeamData {
  teamSlug: string;
  teamName: string;
  totalPoints: number;
}
