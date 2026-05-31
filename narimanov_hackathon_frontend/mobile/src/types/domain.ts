import type { ImageSourcePropType } from 'react-native';

export type Role = 'user' | 'admin';
export type IssueStatus = 'new' | 'ai_review' | 'assigned' | 'in_progress' | 'resolved' | 'overdue' | 'rejected';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'road' | 'lighting' | 'trash' | 'flooding' | 'infrastructure' | 'greenery' | 'other';
export type IssueSource = 'user' | 'ai' | 'camera';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type TimelineItem = {
  action: string;
  by: string;
  time: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  reportedBy: string;
  assignedTo?: string;
  deadline?: string;
  source: IssueSource;
  photo: ImageSourcePropType;
  timeline: TimelineItem[];
  comments: TimelineItem[];
  resolutionProof?: ImageSourcePropType;
};

export type AiDetection = {
  id: string;
  image: ImageSourcePropType;
  detectedCategory: IssueCategory;
  confidence: number;
  priority: IssuePriority;
  location: string;
  latitude: number;
  longitude: number;
  detectedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  linkedIssueId?: string;
};

export type Task = {
  id: string;
  issueId: string;
  title: string;
  department: string;
  priority: IssuePriority;
  deadline: string;
  status: TaskStatus;
  responsible: string;
  progress: number;
};
