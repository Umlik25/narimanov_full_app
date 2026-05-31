import { adminUserName, categoryLabels, currentUserName, departments, issuePhotos, mockAIDetections, mockIssues, mockTasks } from '@/mock/data';
import type { AiDetection, Issue, IssueCategory, IssuePriority, IssueStatus, Role, Task, TaskStatus } from '@/types/domain';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

type SubmitIssueInput = {
  category: IssueCategory;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  photo?: string;
  priority: IssuePriority;
};

type UserProfile = { email: string; name: string; role: Role };

type AppContextValue = {
  aiDetections: AiDetection[];
  approveDetection: (id: string) => void;
  currentUser: UserProfile;
  issues: Issue[];
  login: (role: Role) => void;
  logout: () => void;
  mergeDetection: (id: string, issueId: string) => void;
  pendingAiCount: number;
  rejectDetection: (id: string) => void;
  role: Role | null;
  signup: (name: string, email: string) => void;
  submitIssue: (input: SubmitIssueInput) => Issue;
  switchRole: (role: Role) => void;
  tasks: Task[];
  updateIssue: (id: string, updates: Partial<Pick<Issue, 'assignedTo' | 'deadline' | 'priority' | 'status'>>) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'email' | 'name'>>) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, 'deadline' | 'department' | 'progress' | 'responsible' | 'status'>>) => void;
  userIssues: Issue[];
};

const AppContext = createContext<AppContextValue | null>(null);

function nowLabel() {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function issueFromDetection(detection: AiDetection): Issue {
  return {
    id: `ISS-AI-${detection.id.replace('AI-', '')}`,
    title: `AI detected ${categoryLabels[detection.detectedCategory].toLowerCase()}`,
    description: `AI camera found a likely ${categoryLabels[detection.detectedCategory].toLowerCase()} issue with ${detection.confidence}% confidence.`,
    category: detection.detectedCategory,
    priority: detection.priority,
    status: 'ai_review',
    location: detection.location,
    latitude: detection.latitude,
    longitude: detection.longitude,
    reportedAt: nowLabel(),
    reportedBy: 'AI System',
    source: 'ai',
    photo: detection.image,
    timeline: [
      { time: detection.detectedAt, action: 'Detected by AI camera', by: 'AI System' },
      { time: nowLabel(), action: 'Approved for official review', by: adminUserName },
    ],
    comments: [],
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState({ email: 'anar@example.com', name: currentUserName, role: 'user' as Role });
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [aiDetections, setAiDetections] = useState<AiDetection[]>(mockAIDetections);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const pendingAiCount = aiDetections.filter((item) => item.status === 'pending').length;
  const userIssues = issues.filter((issue) => issue.reportedBy === currentUser.name);

  const value = useMemo<AppContextValue>(() => ({
    aiDetections,
    approveDetection: (id) => {
      const detection = aiDetections.find((item) => item.id === id);
      if (!detection) return;
      const issue = issueFromDetection(detection);
      setIssues((current) => [issue, ...current]);
      setAiDetections((current) => current.map((item) => item.id === id ? { ...item, status: 'approved', linkedIssueId: issue.id } : item));
    },
    currentUser,
    issues,
    login: (nextRole) => {
      setRole(nextRole);
      setCurrentUser(nextRole === 'admin'
        ? { email: 'admin@narimanov.gov.az', name: adminUserName, role: 'admin' }
        : { email: 'anar@example.com', name: currentUserName, role: 'user' });
    },
    logout: () => setRole(null),
    mergeDetection: (id, issueId) => {
      setAiDetections((current) => current.map((item) => item.id === id ? { ...item, status: 'merged', linkedIssueId: issueId } : item));
      setIssues((current) => current.map((issue) => issue.id === issueId ? {
        ...issue,
        timeline: [{ time: nowLabel(), action: `AI detection ${id} merged`, by: adminUserName }, ...issue.timeline],
      } : issue));
    },
    pendingAiCount,
    rejectDetection: (id) => setAiDetections((current) => current.map((item) => item.id === id ? { ...item, status: 'rejected' } : item)),
    role,
    signup: (name, email) => {
      setRole('user');
      setCurrentUser({ email, name: name || currentUserName, role: 'user' });
    },
    submitIssue: (input) => {
      const newIssue: Issue = {
        id: `ISS-${String(100 + issues.length + 1).padStart(3, '0')}`,
        title: `Reported ${categoryLabels[input.category].toLowerCase()}`,
        description: input.description || 'Issue submitted from the mobile app.',
        category: input.category,
        priority: input.priority,
        status: 'new',
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        reportedAt: nowLabel(),
        reportedBy: currentUser.name,
        source: 'user',
        photo: input.photo ? { uri: input.photo } : issuePhotos[input.category === 'road' || input.category === 'lighting' || input.category === 'trash' || input.category === 'flooding' ? input.category : 'ai'],
        timeline: [{ time: nowLabel(), action: 'Issue submitted from mobile app', by: currentUser.name }],
        comments: [],
      };
      setIssues((current) => [newIssue, ...current]);
      return newIssue;
    },
    switchRole: (nextRole) => {
      setRole(nextRole);
      setCurrentUser(nextRole === 'admin'
        ? { email: 'admin@narimanov.gov.az', name: adminUserName, role: 'admin' }
        : { email: 'anar@example.com', name: currentUserName, role: 'user' });
    },
    tasks,
    updateIssue: (id, updates) => {
      setIssues((current) => current.map((issue) => issue.id === id ? {
        ...issue,
        ...updates,
        timeline: [{ time: nowLabel(), action: 'Admin updated issue', by: adminUserName }, ...issue.timeline],
      } : issue));

      if (updates.assignedTo) {
        setTasks((current) => {
          const exists = current.some((task) => task.issueId === id);
          if (exists) {
            return current.map((task) => task.issueId === id ? { ...task, department: updates.assignedTo ?? task.department, deadline: updates.deadline ?? task.deadline } : task);
          }
          const issue = issues.find((item) => item.id === id);
          if (!issue) return current;
          return [{
            id: `TSK-${String(current.length + 1).padStart(3, '0')}`,
            issueId: id,
            title: issue.title,
            department: updates.assignedTo || departments[0],
            priority: issue.priority,
            deadline: updates.deadline || 'June 03, 2026',
            status: 'pending',
            responsible: 'Dispatch Team',
            progress: 0,
          }, ...current];
        });
      }
    },
    updateProfile: (updates) => setCurrentUser((current) => ({ ...current, ...updates })),
    updateTask: (id, updates) => setTasks((current) => current.map((task) => task.id === id ? { ...task, ...updates } : task)),
    userIssues,
  }), [aiDetections, currentUser, issues, pendingAiCount, role, tasks, userIssues]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
