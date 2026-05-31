import type { IssueCategory, IssuePriority, IssueStatus } from '@/types/domain';

export const statusLabels: Record<IssueStatus, string> = {
  new: 'New',
  needs_review: 'Needs review',
  assigned: 'Assigned',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  overdue: 'Overdue',
};

export const priorityLabels: Record<IssuePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const categoryLabels: Record<IssueCategory, string> = {
  trash_overflow: 'Trash overflow',
  road_damage: 'Road damage',
  sidewalk_damage: 'Sidewalk damage',
  flooding: 'Flooding',
  fallen_tree: 'Fallen tree',
  ice_snow: 'Ice and snow',
  lighting_problem: 'Lighting',
  green_area_problem: 'Green area',
  facade_problem: 'Facade',
  other: 'Other',
};
