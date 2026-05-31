export type IssueStatus = 'new' | 'ai_review' | 'assigned' | 'in_progress' | 'resolved' | 'overdue' | 'rejected';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'road' | 'lighting' | 'trash' | 'flooding' | 'infrastructure' | 'greenery' | 'other';

export interface Issue {
  id: string;
  backendId?: number;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  backendStatus?: 'open' | 'assigned' | 'in_progress' | 'resolved';
  moderationStatus?: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'duplicate';
  isPublic?: boolean;
  rewardPoints: number;
  location: string;
  lat: number;
  lng: number;
  reportedAt: string;
  reportedBy: string;
  deadline?: string;
  source: 'user' | 'ai' | 'camera';
  photo: string;
  timeline: { time: string; action: string; by: string }[];
}

export interface AIDetection {
  id: string;
  backendId?: number;
  image: string;
  detectedCategory: IssueCategory;
  confidence: number;
  priority: IssuePriority;
  location: string;
  lat: number;
  lng: number;
  detectedAt: string;
  issue?: Issue;
}

export const ISSUE_PHOTOS = [
  'https://images.unsplash.com/photo-1779179015285-120aaa822b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1579114213255-d8d82bfff681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/flagged/photo-1572213426852-0e4ed8f41ff6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
];

export const mockIssues: Issue[] = [];

export const mockMyIssues: Issue[] = [];

export const mockAIDetections: AIDetection[] = [];

export const STATUS_COLORS: Record<IssueStatus, string> = {
  new: '#0B5CFF', ai_review: '#7C3AED', assigned: '#16A34A',
  in_progress: '#F97316', resolved: '#16A34A', overdue: '#E53935', rejected: '#9CA3AF',
};
export const STATUS_LABELS: Record<IssueStatus, string> = {
  new: 'New', ai_review: 'Review', assigned: 'Approved',
  in_progress: 'In Progress', resolved: 'Resolved', overdue: 'Overdue', rejected: 'Rejected',
};
export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: '#9CA3AF', medium: '#F97316', high: '#EF4444', critical: '#DC2626',
};
export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};
export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  road: 'Road Damage', lighting: 'Street Lighting', trash: 'Waste / Trash',
  flooding: 'Flooding', infrastructure: 'Infrastructure', greenery: 'Green Space', other: 'Other',
};
