import {
  AIDetection,
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from "../components/mockData";
import {
  loginAuthLoginPost,
  meAuthMeGet,
  registerAuthRegisterPost,
  createIssueIssuesPost,
  getIssueDetailsIssuesIssueIdDetailsGet,
  listIssuesIssuesGet,
  uploadIssueImagesIssuesIssueIdImagesPost,
} from "./generated";
import { client } from "./generated/client.gen";
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
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
  source: "backend";
}

export interface CurrentUserSnapshot {
  id?: number;
  displayName: string;
  points: number;
  issuesReported?: number;
  email?: string;
  phoneNumber?: string;
  username?: string;
  role?: string;
  source: "backend";
}

const DEFAULT_API_BASE_URL = "/backend";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
const BACKEND_ENABLED = (import.meta.env.VITE_USE_BACKEND ?? "true") !== "false";
const NARIMANOV_COORDS = { lat: 40.4093, lng: 49.8671 };
const BACKEND_IMAGE_PLACEHOLDER = "/icon.png";
const DATA_OPTIONS = { throwOnError: true as const, responseStyle: "data" as const };
const AUTH_TOKEN_KEY = "city-grind-auth-token";
const EMPTY_USER_SNAPSHOT: CurrentUserSnapshot = {
  displayName: "Citizen User",
  points: 0,
  source: "backend",
};

client.setConfig({
  baseUrl: API_BASE_URL,
  auth: () => getStoredAuthToken() ?? undefined,
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

export function isBackendEnabled() {
  return BACKEND_ENABLED;
}

export function getEmptySnapshot(): BackendSnapshot {
  return {
    issues: [],
    detections: [],
    source: "backend",
  };
}

export function getEmptyCurrentUserSnapshot(): CurrentUserSnapshot {
  return EMPTY_USER_SNAPSHOT;
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function hasStoredAuthToken() {
  return Boolean(getStoredAuthToken());
}

export async function fetchBackendSnapshot(): Promise<BackendSnapshot> {
  if (!BACKEND_ENABLED) return getEmptySnapshot();

  try {
    const issuesResponse = await listIssuesIssuesGet({
      ...DATA_OPTIONS,
      query: { limit: 100, offset: 0 },
    });
    const issuesData = unwrap<IssueListResponse>(issuesResponse);
    const details = await Promise.all(
      issuesData.items.map(async (issue: IssueResponse) => getIssueDetails(issue.id).catch(() => issue)),
    );
    const issues = details.map(issue => mapBackendIssue(issue));

    return {
      issues,
      detections: buildAIDetections(issues),
      source: "backend",
    };
  } catch (error) {
    console.warn("Backend unavailable, using empty local state.", error);
    return getEmptySnapshot();
  }
}

export async function fetchCurrentUserSnapshot(): Promise<CurrentUserSnapshot> {
  if (!BACKEND_ENABLED) return getEmptyCurrentUserSnapshot();

  try {
    return await loadCurrentUserFromAuthMe();
  } catch (error) {
    console.warn("Failed to load current user from auth/me.", error);
  }

  return getEmptyCurrentUserSnapshot();
}

export async function loginWithCredentials(username: string, password: string): Promise<CurrentUserSnapshot> {
  const tokenResponse = unwrap(await loginAuthLoginPost({
    ...DATA_OPTIONS,
    body: { username, password } satisfies AuthLoginRequest,
  }));

  if (!tokenResponse.access_token) {
    throw new Error("Login succeeded but no access token was returned.");
  }

  setStoredAuthToken(tokenResponse.access_token);

  try {
    return await loadCurrentUserFromAuthMe();
  } catch (error) {
    clearStoredAuthToken();
    throw error;
  }
}

export async function registerWithCredentials(input: AuthRegisterRequest): Promise<CurrentUserSnapshot> {
  await registerAuthRegisterPost({
    ...DATA_OPTIONS,
    body: input,
  });

  return loginWithCredentials(input.username, input.password);
}

export async function hydrateSession(): Promise<CurrentUserSnapshot | null> {
  if (!hasStoredAuthToken()) return null;

  try {
    return await loadCurrentUserFromAuthMe();
  } catch (error) {
    console.warn("Stored auth token could not be validated; clearing session.", error);
    clearStoredAuthToken();
    return null;
  }
}

export function logout() {
  clearStoredAuthToken();
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

  return mapBackendIssue(await getIssueDetails(issue.id).catch(() => issue));
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

async function loadCurrentUserFromAuthMe() {
  const user = unwrap(await meAuthMeGet(DATA_OPTIONS));
  const normalized = normalizeCurrentUser(user);
  if (!normalized) {
    throw new Error("Current user response was empty or invalid.");
  }
  return normalized;
}

function normalizeCurrentUser(payload: unknown): CurrentUserSnapshot | null {
  const record = extractUserRecord(payload);
  if (!record) return null;

  const displayName = pickString(record, ["display_name", "full_name", "name", "username", "email"]) ?? EMPTY_USER_SNAPSHOT.displayName;
  const points = pickNumber(record, ["points", "reward_points", "balance", "score", "available_points", "point_balance"]) ?? 0;

  return {
    id: pickNumber(record, ["id", "user_id"]),
    displayName,
    username: pickString(record, ["username"]),
    points,
    issuesReported: pickNumber(record, ["issues_reported", "reported_issues", "issue_count"]),
    email: pickString(record, ["email"]),
    phoneNumber: pickString(record, ["phone_number", "phone"]),
    role: pickString(record, ["role"]),
    source: "backend",
  };
}

function extractUserRecord(payload: unknown): Record<string, unknown> | null {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    return payload[0] && typeof payload[0] === "object" ? (payload[0] as Record<string, unknown>) : null;
  }

  if (typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items) && record.items[0] && typeof record.items[0] === "object") {
    return record.items[0] as Record<string, unknown>;
  }

  return record;
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function mapBackendIssue(issue: ApiIssue): Issue {
  const category = categoryFromBackend[issue.category] || "other";
  const priority = (issue.severity || "medium") as IssuePriority;
  const status = mapStatus(issue);
  const backendPhoto = issue.images?.[0]?.url || issue.primary_image_url;
  const photo = backendPhoto ? resolveBackendAssetUrl(backendPhoto) : BACKEND_IMAGE_PLACEHOLDER;
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
  if (issue.status === "assigned") return "assigned";
  return "new";
}

function resolveBackendAssetUrl(value: string) {
  if (/^https?:/i.test(value)) return `/backend-asset?url=${encodeURIComponent(value)}`;
  if (/^(blob:|data:)/i.test(value)) return value;
  if (value.startsWith('/backend/')) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
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
