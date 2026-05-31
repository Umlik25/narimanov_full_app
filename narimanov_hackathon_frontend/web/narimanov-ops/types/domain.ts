export type UserRole = 'admin' | 'user' | 'ai_system';

export type IssueCategory =
  | 'trash_overflow'
  | 'road_damage'
  | 'sidewalk_damage'
  | 'flooding'
  | 'fallen_tree'
  | 'ice_snow'
  | 'lighting_problem'
  | 'green_area_problem'
  | 'facade_problem'
  | 'other';

export type IssueStatus =
  | 'new'
  | 'needs_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'overdue';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueSource =
  | 'citizen_report'
  | 'inspector_report'
  | 'bus_camera'
  | 'street_camera'
  | 'ai_detection';

export type DetectionStatus = 'needs_review' | 'approved' | 'rejected' | 'merged';

export type IssueHistoryAction =
  | 'issue_created'
  | 'status_changed'
  | 'assigned_to_department'
  | 'deadline_updated'
  | 'comment_added'
  | 'issue_resolved'
  | 'issue_rejected'
  | 'ai_detection_approved'
  | 'ai_detection_rejected';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Department = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  contactPhone: string;
  activeIssues: number;
};

export type User = {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string | null;
  avatarInitials: string;
};

export type IssueHistoryItem = {
  id: string;
  issue_id: string;
  action: IssueHistoryAction;
  old_value: string | null;
  new_value: string | null;
  user_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  issue_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type Attachment = {
  id: string;
  issue_id: string;
  type: 'report_photo' | 'ai_snapshot' | 'resolution_photo';
  url: string;
  created_at: string;
};

export type Issue = Coordinates & {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  address: string;
  photo_url: string;
  source: IssueSource;
  confidence: number | null;
  assigned_to: string | null;
  department_id: string | null;
  deadline: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  history: IssueHistoryItem[];
  comments: Comment[];
  attachments: Attachment[];
};

export type AiDetection = Coordinates & {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  image_url: string;
  video_source: string;
  confidence: number;
  source: Extract<IssueSource, 'bus_camera' | 'street_camera' | 'ai_detection'>;
  raw_model_output: {
    model: string;
    label: string;
    bbox?: [number, number, number, number];
    reasoning_summary: string;
  };
  status: DetectionStatus;
  linked_issue_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type DashboardSummary = {
  total_issues: number;
  new_issues: number;
  in_progress: number;
  resolved: number;
  overdue: number;
  ai_detected: number;
};
