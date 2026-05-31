import { aiDetections, departments, issues, users } from '@/mock';
import type { AiDetection, DashboardSummary, Issue, IssueStatus } from '@/types/domain';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const countByStatus = (status: IssueStatus) =>
  issues.filter((issue) => issue.status === status).length;

export async function getIssues(): Promise<Issue[]> {
  await delay();
  return issues;
}

export async function getIssueById(id: string): Promise<Issue | undefined> {
  await delay();
  return issues.find((issue) => issue.id === id);
}

export async function getAiDetections(): Promise<AiDetection[]> {
  await delay();
  return aiDetections;
}

export async function getPendingAiDetections(): Promise<AiDetection[]> {
  await delay();
  return aiDetections.filter((detection) => detection.status === 'needs_review');
}

export async function getDepartments() {
  await delay();
  return departments;
}

export async function getUsers() {
  await delay();
  return users;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay();

  return {
    total_issues: issues.length,
    new_issues: countByStatus('new'),
    in_progress: countByStatus('in_progress'),
    resolved: countByStatus('resolved'),
    overdue: countByStatus('overdue'),
    ai_detected: issues.filter((issue) => issue.source === 'ai_detection').length + aiDetections.length,
  };
}
