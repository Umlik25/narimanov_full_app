export type IssueStatus = 'new' | 'ai_review' | 'assigned' | 'in_progress' | 'resolved' | 'overdue' | 'rejected';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'road' | 'lighting' | 'trash' | 'flooding' | 'infrastructure' | 'greenery' | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  rewardPoints: number;
  location: string;
  lat: number;
  lng: number;
  reportedAt: string;
  reportedBy: string;
  assignedTo?: string;
  deadline?: string;
  source: 'user' | 'ai' | 'camera';
  photo: string;
  timeline: { time: string; action: string; by: string }[];
}

export interface AIDetection {
  id: string;
  image: string;
  detectedCategory: IssueCategory;
  confidence: number;
  priority: IssuePriority;
  location: string;
  lat: number;
  lng: number;
  detectedAt: string;
}

export interface Task {
  id: string;
  issueId: string;
  title: string;
  department: string;
  priority: IssuePriority;
  rewardPoints: number;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  responsible: string;
  progress: number;
}

export const ISSUE_PHOTOS = [
  'https://images.unsplash.com/photo-1779179015285-120aaa822b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1579114213255-d8d82bfff681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/flagged/photo-1572213426852-0e4ed8f41ff6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
];

export const mockIssues: Issue[] = [
  {
    id: 'ISS-001', title: 'Large pothole on Haji Murad street',
    description: 'Deep pothole near intersection causing danger for vehicles and cyclists. ~30cm wide, 15cm deep.',
    category: 'road', priority: 'high', status: 'in_progress', rewardPoints: 80,
    location: 'Haji Murad St, Narimanov', lat: 40.4115, lng: 49.8680,
    reportedAt: '2026-05-28 09:15', reportedBy: 'Anar Məmmədov',
    assignedTo: 'Road Repair Department', deadline: '2026-06-02', source: 'user',
    photo: ISSUE_PHOTOS[0],
    timeline: [
      { time: '2026-05-28 09:15', action: 'Issue reported', by: 'Anar Məmmədov' },
      { time: '2026-05-28 10:30', action: 'Under AI review', by: 'System' },
      { time: '2026-05-28 14:00', action: 'Assigned to Road Repair Dept', by: 'Admin Rauf' },
      { time: '2026-05-29 08:00', action: 'Work started', by: 'Road Repair Department' },
    ],
  },
  {
    id: 'ISS-002', title: 'Broken street lighting on Ataturk Ave',
    description: 'Three consecutive street lights not working, creating dark stretch on main avenue.',
    category: 'lighting', priority: 'medium', status: 'assigned', rewardPoints: 55,
    location: 'Ataturk Avenue, Narimanov', lat: 40.4090, lng: 49.8660,
    reportedAt: '2026-05-27 20:45', reportedBy: 'Leyla Həsənova',
    assignedTo: 'Electricity Department', deadline: '2026-06-01', source: 'user',
    photo: ISSUE_PHOTOS[1],
    timeline: [
      { time: '2026-05-27 20:45', action: 'Issue reported', by: 'Leyla Həsənova' },
      { time: '2026-05-28 09:00', action: 'Verified and assigned', by: 'Admin Rauf' },
    ],
  },
  {
    id: 'ISS-003', title: 'Illegal waste dump near park',
    description: 'Large accumulation of construction waste dumped near Atatürk Park entrance.',
    category: 'trash', priority: 'high', status: 'overdue', rewardPoints: 95,
    location: 'Atatürk Parkı, Narimanov', lat: 40.4070, lng: 49.8700,
    reportedAt: '2026-05-24 11:00', reportedBy: 'Cavid Quliyev',
    assignedTo: 'Sanitation Department', deadline: '2026-05-28', source: 'user',
    photo: ISSUE_PHOTOS[2],
    timeline: [
      { time: '2026-05-24 11:00', action: 'Issue reported', by: 'Cavid Quliyev' },
      { time: '2026-05-24 15:00', action: 'Assigned', by: 'Admin Rauf' },
      { time: '2026-05-29 09:00', action: 'Marked overdue', by: 'System' },
    ],
  },
  {
    id: 'ISS-004', title: 'Road flooding after rain on Mammad Araz',
    description: 'Severe water accumulation blocking traffic for hours after rainfall.',
    category: 'flooding', priority: 'critical', status: 'new', rewardPoints: 120,
    location: 'Mammad Araz St, Narimanov', lat: 40.4080, lng: 49.8650,
    reportedAt: '2026-05-30 07:30', reportedBy: 'Günel Əliyeva', source: 'user',
    photo: ISSUE_PHOTOS[3],
    timeline: [{ time: '2026-05-30 07:30', action: 'Issue reported', by: 'Günel Əliyeva' }],
  },
  {
    id: 'ISS-005', title: 'AI Detected: Damaged sidewalk tiles',
    description: 'AI vision detected multiple broken sidewalk tiles creating trip hazards.',
    category: 'infrastructure', priority: 'medium', status: 'ai_review', rewardPoints: 40,
    location: 'Ziya Bunyadov Ave, Narimanov', lat: 40.4100, lng: 49.8640,
    reportedAt: '2026-05-29 14:20', reportedBy: 'AI System', source: 'ai',
    photo: ISSUE_PHOTOS[4],
    timeline: [{ time: '2026-05-29 14:20', action: 'Detected by AI Camera', by: 'AI System' }],
  },
  {
    id: 'ISS-006', title: 'Graffiti removal on public wall',
    description: 'Graffiti on public wall near school successfully removed.',
    category: 'infrastructure', priority: 'low', status: 'resolved', rewardPoints: 35,
    location: 'Sabit Rahman St, Narimanov', lat: 40.4055, lng: 49.8680,
    reportedAt: '2026-05-20 10:00', reportedBy: 'Əli Babayev',
    assignedTo: 'Public Works', source: 'user',
    photo: ISSUE_PHOTOS[0],
    timeline: [
      { time: '2026-05-20 10:00', action: 'Issue reported', by: 'Əli Babayev' },
      { time: '2026-05-21 09:00', action: 'Assigned', by: 'Admin Rauf' },
      { time: '2026-05-23 16:00', action: 'Resolved', by: 'Public Works' },
    ],
  },
];

export const mockMyIssues: Issue[] = [mockIssues[0], mockIssues[3]];

export const mockAIDetections: AIDetection[] = [
  { id: 'AI-001', image: ISSUE_PHOTOS[4], detectedCategory: 'road', confidence: 94, priority: 'high', location: 'Haji Murad St, near junction', lat: 40.4118, lng: 49.8672, detectedAt: '2026-05-30 06:15' },
  { id: 'AI-002', image: ISSUE_PHOTOS[2], detectedCategory: 'trash', confidence: 87, priority: 'medium', location: 'Ganjlik Ave, block 3', lat: 40.4065, lng: 49.8710, detectedAt: '2026-05-30 07:40' },
  { id: 'AI-003', image: ISSUE_PHOTOS[1], detectedCategory: 'lighting', confidence: 79, priority: 'medium', location: 'Alovsat Abdulrahimov St', lat: 40.4040, lng: 49.8665, detectedAt: '2026-05-29 23:50' },
  { id: 'AI-004', image: ISSUE_PHOTOS[3], detectedCategory: 'flooding', confidence: 91, priority: 'critical', location: 'Mukhtarov St underpass', lat: 40.4085, lng: 49.8630, detectedAt: '2026-05-30 08:00' },
];

export const mockTasks: Task[] = [
  { id: 'TSK-001', issueId: 'ISS-001', title: 'Repair pothole on Haji Murad St', department: 'Road Repair Department', priority: 'high', rewardPoints: 80, deadline: '2026-06-02', status: 'in_progress', responsible: 'Fuad Ismayilov', progress: 40 },
  { id: 'TSK-002', issueId: 'ISS-002', title: 'Fix broken street lights on Ataturk Ave', department: 'Electricity Department', priority: 'medium', rewardPoints: 55, deadline: '2026-06-01', status: 'pending', responsible: 'Nihat Aliyev', progress: 0 },
  { id: 'TSK-003', issueId: 'ISS-003', title: 'Clear waste dump near Atatürk Park', department: 'Sanitation Department', priority: 'high', rewardPoints: 95, deadline: '2026-05-28', status: 'overdue', responsible: 'Sanitation Team B', progress: 10 },
  { id: 'TSK-004', issueId: 'ISS-004', title: 'Emergency drainage - Mammad Araz flooding', department: 'Infrastructure Department', priority: 'critical', rewardPoints: 120, deadline: '2026-05-30', status: 'in_progress', responsible: 'Emergency Response Team', progress: 60 },
  { id: 'TSK-005', issueId: 'ISS-006', title: 'Tree trimming - Sabit Rahman St', department: 'Green Space Department', priority: 'low', rewardPoints: 35, deadline: '2026-06-10', status: 'completed', responsible: 'Green Team A', progress: 100 },
];

export const STATUS_COLORS: Record<IssueStatus, string> = {
  new: '#0B5CFF', ai_review: '#7C3AED', assigned: '#F97316',
  in_progress: '#F97316', resolved: '#16A34A', overdue: '#E53935', rejected: '#9CA3AF',
};
export const STATUS_LABELS: Record<IssueStatus, string> = {
  new: 'New', ai_review: 'AI Review', assigned: 'Assigned',
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
export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  road: '🚧', lighting: '💡', trash: '🗑️', flooding: '🌊',
  infrastructure: '🏗️', greenery: '🌳', other: '📌',
};
