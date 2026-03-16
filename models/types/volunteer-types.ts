// Volunteer matching and request types
export interface SchoolRequest {
  requestId: string;
  schoolUid: string;
  subjectsRequired: string[];
  classesRequired: string[];
  volunteersNeeded: number;
  district: string;
  state: string;
  status: 'open' | 'closed' | 'filled';
  urgency: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerMatch {
  volunteerUid: string;
  requestId: string;
  schoolUid: string;
  matchScore: number;
  matchReasons: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
