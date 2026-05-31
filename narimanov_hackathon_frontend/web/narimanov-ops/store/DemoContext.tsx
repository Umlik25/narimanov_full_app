import { aiDetections as seedDetections, issues as seedIssues } from '@/mock';
import type { AiDetection, Issue, UserRole } from '@/types/domain';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

type AppRole = Extract<UserRole, 'admin'> | 'user';

type DemoContextValue = {
  aiDetections: AiDetection[];
  approveDetection: (id: string) => void;
  issues: Issue[];
  pendingAiCount: number;
  rejectDetection: (id: string) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
  submitIssue: (issue: Issue) => void;
  mergeDetection: (id: string, issueId: string) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);
const fallbackCoordinates = { latitude: 40.4099, longitude: 49.8677 };

function cleanCoordinate(value: unknown, fallback: number) {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeIssueCoordinates(issue: Issue): Issue {
  const latitude = cleanCoordinate(issue.latitude, fallbackCoordinates.latitude);
  const longitude = cleanCoordinate(issue.longitude, fallbackCoordinates.longitude);

  if (latitude === issue.latitude && longitude === issue.longitude) {
    return issue;
  }

  return {
    ...issue,
    latitude,
    longitude,
    address: issue.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
  };
}

function createIssueFromDetection(detection: AiDetection): Issue {
  const latitude = cleanCoordinate(detection.latitude, fallbackCoordinates.latitude);
  const longitude = cleanCoordinate(detection.longitude, fallbackCoordinates.longitude);

  return {
    id: `ISS-AI-${detection.id.replace('DET-', '')}`,
    title: detection.title.replace('Possible ', '').replace(' detected', ''),
    description: detection.description,
    category: detection.category,
    status: 'needs_review',
    priority: detection.priority,
    latitude,
    longitude,
    address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    photo_url: detection.image_url,
    source: 'ai_detection',
    confidence: detection.confidence,
    assigned_to: null,
    department_id: null,
    deadline: null,
    created_by: 'ai_system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    resolved_at: null,
    history: [],
    comments: [],
    attachments: [],
  };
}

export function DemoProvider({ children }: PropsWithChildren) {
  const [role, setRoleState] = useState<AppRole>(() => {
    try {
      const saved = globalThis.localStorage?.getItem('narimanov-role');
      return saved === 'user' ? 'user' : 'admin';
    } catch {
      return 'admin';
    }
  });
  const [issues, setIssues] = useState<Issue[]>(() => seedIssues.map(normalizeIssueCoordinates));
  const [aiDetections, setAiDetections] = useState<AiDetection[]>(seedDetections);

  const pendingAiCount = aiDetections.filter((item) => item.status === 'needs_review').length;
  const setRole = (nextRole: AppRole) => {
    setRoleState(nextRole);
    try {
      globalThis.localStorage?.setItem('narimanov-role', nextRole);
    } catch {
      // Storage is optional in native/test environments.
    }
  };

  const value = useMemo<DemoContextValue>(() => ({
    aiDetections,
    approveDetection: (id) => {
      const detection = aiDetections.find((item) => item.id === id);
      if (detection) {
        const officialIssue = normalizeIssueCoordinates(createIssueFromDetection(detection));
        setIssues((current) => [
          officialIssue,
          ...current.map(normalizeIssueCoordinates),
        ]);
      }
      setAiDetections((current) => current.map((item) => item.id === id ? { ...item, status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'admin_1' } : item));
    },
    issues,
    mergeDetection: (id, issueId) => {
      setAiDetections((current) => current.map((item) => item.id === id ? { ...item, status: 'merged', linked_issue_id: issueId, reviewed_at: new Date().toISOString(), reviewed_by: 'admin_1' } : item));
    },
    pendingAiCount,
    rejectDetection: (id) => {
      setAiDetections((current) => current.map((item) => item.id === id ? { ...item, status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: 'admin_1' } : item));
    },
    role,
    setRole,
    submitIssue: (issue) => setIssues((current) => [normalizeIssueCoordinates(issue), ...current.map(normalizeIssueCoordinates)]),
  }), [aiDetections, issues, pendingAiCount, role]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}
