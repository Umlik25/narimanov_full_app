import type { Department } from '@/types/domain';

export const departments: Department[] = [
  {
    id: 'dept_sanitation',
    name: 'Sanitation Department',
    shortName: 'Sanitation',
    color: '#2563EB',
    contactPhone: '+994 12 555 0101',
    activeIssues: 18,
  },
  {
    id: 'dept_roads',
    name: 'Road Maintenance Department',
    shortName: 'Roads',
    color: '#EA580C',
    contactPhone: '+994 12 555 0102',
    activeIssues: 24,
  },
  {
    id: 'dept_green',
    name: 'Green Spaces Department',
    shortName: 'Green Spaces',
    color: '#16A34A',
    contactPhone: '+994 12 555 0103',
    activeIssues: 9,
  },
  {
    id: 'dept_emergency',
    name: 'Emergency Response Department',
    shortName: 'Emergency',
    color: '#DC2626',
    contactPhone: '+994 12 555 0104',
    activeIssues: 7,
  },
  {
    id: 'dept_lighting',
    name: 'Lighting Department',
    shortName: 'Lighting',
    color: '#D97706',
    contactPhone: '+994 12 555 0105',
    activeIssues: 11,
  },
  {
    id: 'dept_general',
    name: 'General Municipal Service',
    shortName: 'Municipal',
    color: '#64748B',
    contactPhone: '+994 12 555 0106',
    activeIssues: 13,
  },
];
