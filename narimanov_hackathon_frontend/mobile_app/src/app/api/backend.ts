import {
  AIDetection,
  ISSUE_PHOTOS,
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from "../components/mockData";
import {
  createIssueIssuesPost,
  getIssueDetailsIssuesIssueIdDetailsGet,
  listIssuesForModerationIssuesModerationGet,
  uploadIssueImagesIssuesIssueIdImagesPost,
} from "./generated";
import { client } from "./generated/client.gen";
import type {
  IssueCategory as ApiIssueCategory,
  IssueCreate,
  IssueDetailsResponse,
  IssueListResponse,
  IssueResponse,
  IssueSeverity,
} from "./generated";

type ApiIssue = IssueResponse & Partial<IssueDetailsResponse>;

export interface IssueDraft {
  category: IssueCategory;
  description: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  photoFile?: File;
  photoPreviewUrl?: string;
  priority?: IssuePriority;
  title: string;
}

export interface BackendSnapshot {
  issues: Issue[];
  detections: AIDetection[];
  source: "backend" | "mock";
}

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
const BACKEND_ENABLED = (import.meta.env.VITE_USE_BACKEND ?? "true") !== "false";
const NARIMANOV_COORDS = { lat: 40.4093, lng: 49.8671 };
const DATA_OPTIONS = { throwOnError: true as const, responseStyle: "data" as const };

client.setConfig({
  baseUrl: API_BASE_URL,
  throwOnError: true,
  responseStyle: "data",
});

const categoryToBackend: Record<IssueCategory, ApiIssueCategory> = {
  road: "roads",
  lighting: "lighting",
  trash: "garbage",
  flooding: "flooding",
  infrastructure: "public_space_damage",
  greenery: "public_space_damage",
  other: "emergency",
};

const categoryFromBackend: Record<ApiIssueCategory, IssueCategory> = {
  roads: "road",
  lighting: "lighting",
  garbage: "trash",
  flooding: "flooding",
  water: "flooding",
  electricity: "lighting",
  gas: "infrastructure",
  public_space_damage: "infrastructure",
  emergency: "other",
};

const rewardByCategory: Record<IssueCategory, number> = {
  road: 80,
  lighting: 55,
  trash: 95,
  flooding: 120,
  infrastructure: 60,
  greenery: 45,
  other: 30,
};

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getMockSnapshot(): BackendSnapshot {
  return {
    issues: [],
    detections: [],
    source: "mock",
  };
}

export async function fetchBackendSnapshot(): Promise<BackendSnapshot> {
  if (!BACKEND_ENABLED) return getMockSnapshot();

  try {
    const moderation = await listIssuesForModerationIssuesModerationGet({
      ...DATA_OPTIONS,
      query: { limit: 100, offset: 0 },
    });
    const moderationData = unwrap<IssueListResponse>(moderation);
    const details = await Promise.all(
      moderationData.items.map(async (issue: IssueResponse) => getIssueDetails(issue.id).catch(() => issue)),
    );
    const issues = details.map(issue => mapBackendIssue(issue, issue.id));

    return {
      issues,
      detections: buildAIDetections(issues),
      source: "backend",
    };
  } catch (error) {
    console.warn("Backend unavailable, using empty local state.", error);
    return getMockSnapshot();
  }
}

export async function createIssue(draft: IssueDraft): Promise<Issue> {
  const category = draft.category;
  const latitude = draft.latitude ?? NARIMANOV_COORDS.lat;
  const longitude = draft.longitude ?? NARIMANOV_COORDS.lng;
  const title = draft.title.trim();

  const payload: IssueCreate = {
    title,
    description: draft.description.trim(),
    category: categoryToBackend[category],
    severity: (draft.priority || "medium") as IssueSeverity,
    latitude,
    longitude,
    address: draft.location || `Latitude ${latitude}, Longitude ${longitude}`,
    district: "Narimanov",
    source: "mobile_report",
  };

  const issue = unwrap<IssueResponse>(await createIssueIssuesPost({
    ...DATA_OPTIONS,
    body: payload,
  }));

  if (draft.photoFile) {
    try {
      await uploadIssueImagesIssuesIssueIdImagesPost({
        ...DATA_OPTIONS,
        path: { issue_id: issue.id },
        body: { files: [draft.photoFile] },
      });
    } catch (error) {
      console.warn("Issue image upload failed; keeping local photo preview.", error);
    }
  }

  const mapped = mapBackendIssue(await getIssueDetails(issue.id).catch(() => issue));
  return draft.photoPreviewUrl && ISSUE_PHOTOS.includes(mapped.photo)
    ? { ...mapped, photo: draft.photoPreviewUrl }
    : mapped;
}

async function getIssueDetails(issueId: number) {
  return unwrap<IssueDetailsResponse>(await getIssueDetailsIssuesIssueIdDetailsGet({
    ...DATA_OPTIONS,
    path: { issue_id: issueId },
  }));
}

function unwrap<T>(value: T | { data: T; request?: Request; response?: Response }): T {
  if (value && typeof value === "object" && "data" in value && "response" in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

function mapBackendIssue(issue: ApiIssue, index = issue.id): Issue {
  const category = categoryFromBackend[issue.category] || "other";
  const priority = (issue.severity || "medium") as IssuePriority;
  const status = mapStatus(issue);
  const photo = issue.images?.[0]?.url || ISSUE_PHOTOS[Math.abs(index) % ISSUE_PHOTOS.length];
  const source = issue.source === "ai_detection" || issue.source === "street_camera" ? "ai" : "user";
  const reportedAt = formatDateTime(issue.created_at);

  return {
    id: `ISS-${String(issue.id).padStart(3, "0")}`,
    backendId: issue.id,
    title: issue.title,
    description: issue.description,
    category,
    priority,
    status,
    backendStatus: issue.status,
    moderationStatus: issue.moderation_status,
    isPublic: issue.is_public,
    rewardPoints: rewardByCategory[category],
    location: issue.address || issue.district || "Narimanov, Baku",
    lat: issue.latitude,
    lng: issue.longitude,
    reportedAt,
    reportedBy: source === "ai" ? "System" : "Citizen Reporter",
    deadline: issue.deadline ? formatDate(issue.deadline) : undefined,
    source,
    photo,
    timeline: issue.audit_trail?.length
      ? issue.audit_trail.map(event => ({
          time: formatDateTime(event.created_at),
          action: formatAuditTitle(event.title),
          by: event.actor_name || event.actor_role || "System",
        }))
      : [{ time: reportedAt, action: "Issue submitted", by: source === "ai" ? "System" : "Citizen Reporter" }],
  };
}

function mapStatus(issue: ApiIssue): IssueStatus {
  if (issue.moderation_status === "rejected" || issue.moderation_status === "duplicate") return "rejected";
  if (issue.moderation_status === "submitted" || issue.moderation_status === "under_review") {
    return issue.source === "ai_detection" || issue.source === "street_camera" ? "ai_review" : "new";
  }
  if (issue.status === "resolved") return "resolved";
  if (issue.deadline && new Date(issue.deadline).getTime() < Date.now()) return "overdue";
  if (issue.status === "in_progress") return "in_progress";
  if (issue.status === "assigned") return "assigned";
  return "new";
}

function buildAIDetections(issues: Issue[], useFallback = false): AIDetection[] {
  const detections = issues
    .filter(issue => issue.source === "ai" || issue.status === "ai_review")
    .map((issue, index) => ({
      id: issue.id.replace("ISS", "AI"),
      backendId: issue.backendId,
      image: issue.photo,
      detectedCategory: issue.category,
      confidence: Math.max(78, 94 - index * 3),
      priority: issue.priority,
      location: issue.location,
      lat: issue.lat,
      lng: issue.lng,
      detectedAt: issue.reportedAt,
      issue,
    }));

  return detections.length || !useFallback ? detections : [];
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function formatAuditTitle(title: string) {
  return title.replace(/\bassigned\b/gi, "accepted");
}
