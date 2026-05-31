import type { User } from '@/types/domain';

export const users: User[] = [
  {
    id: 'admin_1',
    name: 'Ayla Mammadova',
    role: 'admin',
    departmentId: null,
    avatarInitials: 'AM',
  },
  {
    id: 'inspector_1',
    name: 'Rashad Karimov',
    role: 'user',
    departmentId: 'dept_general',
    avatarInitials: 'RK',
  },
  {
    id: 'executor_roads_1',
    name: 'Tural Hasanli',
    role: 'admin',
    departmentId: 'dept_roads',
    avatarInitials: 'TH',
  },
  {
    id: 'executor_sanitation_1',
    name: 'Leyla Aliyeva',
    role: 'admin',
    departmentId: 'dept_sanitation',
    avatarInitials: 'LA',
  },
  {
    id: 'ai_system_1',
    name: 'Openwave Vision System',
    role: 'ai_system',
    departmentId: null,
    avatarInitials: 'AI',
  },
];
