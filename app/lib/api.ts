import {
  type ApiListResponse,
  type Chubby,
  type CreateChubbyInput,
  type CreateFeedInput,
  type CreateMasterInput,
  type Feed,
  type Master
} from "./types";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }
  return baseUrl;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as Record<string, unknown>;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function normalizeList<T>(payload: ApiListResponse<T> | Record<string, unknown> | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  if ("items" in payload && Array.isArray(payload.items)) {
    return payload.items as T[];
  }
  if ("data" in payload && Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value));
  return Array.isArray(firstArray) ? (firstArray as T[]) : [];
}

function mapMaster(item: any): Master {
  return {
    id: item.masterPersonId?.S,
    name: item.name?.S,
    createdAt: item.createdAt?.S,
    sex: item.sex?.S
  };
}

function mapChubby(item: any): Chubby {
  return {
    id: item.chubbyPersonId?.S,
    name: item.name?.S,
    createdAt: item.createdAt?.S,
    sex: item.sex?.S
  };
}

function mapFeed(item: unknown, index: number): Feed {
  const record = toRecord(item);
  const id = toStringValue(record.id ?? record.feedId, `feed-${index}`);
  const chubbyId = toStringValue(record.chubbyId ?? record.chubby_id);
  const name = toStringValue(record.name ?? record.feedName, "ごはん");
  const date = toStringValue(record.date ?? record.createdAt ?? record.created_at, new Date().toISOString());

  return {
    id,
    chubbyId,
    name,
    date
  };
}

function createUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;
  const response = await fetch(createUrl(path, query), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed (${response.status}): ${text || response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function getMasters(): Promise<Master[]> {
  const payload = await request<ApiListResponse<unknown> | Record<string, unknown>>("/getMasters");
  return normalizeList(payload).map(mapMaster);
}

export async function createMaster(input: CreateMasterInput): Promise<Master> {
  const payload = await request<unknown>("/masters", {
    method: "POST",
    body: input
  });

  const created = mapMaster(payload);
  return {
    ...created,
    id: created.id || `master-${Date.now()}`,
    name: created.name || input.name
  };
}

export async function getChubbies(masterId?: string): Promise<Chubby[]> {
  const payload = await request<ApiListResponse<unknown> | Record<string, unknown>>("/getChubbies", {
    query: {
      masterId
    }
  });
  return normalizeList(payload).map(mapChubby);
}

export async function createChubby(input: CreateChubbyInput): Promise<Chubby> {
  const payload = await request<unknown>("/chubbies", {
    method: "POST",
    body: input
  });

  const created = mapChubby(payload);
  return {
    ...created,
    id: created.id || `chubby-${Date.now()}`,
    name: created.name || input.name,
    sex: created.sex || input.sex
  };
}

export async function getFeedRireki(chubbyId: string, date?: string): Promise<Feed[]> {
  const payload = await request<ApiListResponse<unknown> | Record<string, unknown>>("/getFeedRireki", {
    query: {
      chubbyPersonId: chubbyId,
      date
    }
  });
  return normalizeList(payload).map(mapFeed);
}

export async function createFeed(input: CreateFeedInput): Promise<Feed> {
  const payload = await request<unknown>("/feed", {
    method: "POST",
    body: input
  });

  const created = mapFeed(payload, 0);
  return {
    ...created,
    id: created.id || `feed-${Date.now()}`,
    chubbyId: created.chubbyId || input.chubbyId,
    name: created.name || input.name,
    date: created.date || input.date
  };
}