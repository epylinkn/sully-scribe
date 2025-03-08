export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  upcomingAppointments: Array<{
    date: string;
    time: string;
    type: string;
  }>;
  recentVisits: Array<{
    date: string;
    reason: string;
    notes: string;
  }>;
} 
