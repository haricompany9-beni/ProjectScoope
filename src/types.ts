export type ProjectType = 'website' | 'mobile';

export interface Project {
  id?: string;
  type: ProjectType;
  projectName: string;
  description: string;
  goals: string;
  targetAudience: string;
  existingSolution?: string;
  platform?: string; // e.g., 'iOS', 'Android', 'Both' or URL
  pagesOrFeatures: string[];
  brandingStatus: string;
  references?: string;
  specificNeeds: string[];
  budget: string;
  deadline: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'new' | 'in_progress' | 'completed';
  createdAt: any; // Firestore Timestamp
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'multiselect';
  options?: string[];
  field: string;
  subField?: string;
}
