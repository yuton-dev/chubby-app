import {
  type ApiListResponse,
  type Chubby,
  type CreateChubbyInput,
  type CreateFeedInput,
  type CreateMasterInput,
  type DeleteFeedInput,
  type Feed,
  type Master,
  type MealType
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

function mapMaster(item: unknown): Master {
  const record = toRecord(item);
  return {
    id: toStringValue(toRecord(record.masterPersonId).S),
    name: toStringValue(toRecord(record.name).S),
    createdAt: toStringValue(toRecord(record.createdAt).S) || undefined,
    sex: toStringValue(toRecord(record.sex).S)
  };
}

function mapChubby(item: unknown): Chubby {
  const record = toRecord(item);
  return {
    id: toStringValue(toRecord(record.chubbyPersonId).S),
    name: toStringValue(toRecord(record.name).S),
    createdAt: toStringValue(toRecord(record.createdAt).S) || undefined,
    sex: toStringValue(toRecord(record.sex).S)
  };
}

function mapFeed(item: unknown, index: number): Feed {
  const record = toRecord(item);
  const id = toStringValue(
    record.id ?? toRecord(record.id).S ?? record.feedId ?? toRecord(record.feedId).S,
    `feed-${index}`
  );
  const chubbyId = toStringValue(
    record.chubbyId ?? toRecord(record.chubbyId).S ?? record.chubby_id ?? toRecord(record.chubby_id).S
  );
  const name = toStringValue(
    record.name ?? toRecord(record.name).S ?? record.feedName ?? toRecord(record.feedName).S,
    "ごはん"
  );
  const rawMealType = toStringValue(
    record.mealType ??
      toRecord(record.mealType).S ??
      record.feedType ??
      toRecord(record.feedType).S ??
      record.kubun ??
      toRecord(record.kubun).S
  );
  const mealType = rawMealType ? (rawMealType as MealType) : undefined;
  const caloriesRaw =
    record.calories ??
    toRecord(record.calories).N ??
    record.kcal ??
    toRecord(record.kcal).N;
  const calories =
    typeof caloriesRaw === "number"
      ? caloriesRaw
      : typeof caloriesRaw === "string"
        ? Number(caloriesRaw)
        : undefined;
  const masterId = toStringValue(
    record.masterId ??
      toRecord(record.masterId).S ??
      record.masterPersonId ??
      toRecord(record.masterPersonId).S
  );
  const masterName = toStringValue(
    record.masterName ??
      toRecord(record.masterName).S ??
      record.masterPersonName ??
      toRecord(record.masterPersonName).S ??
      record.from ??
      toRecord(record.from).S
  );
  const date = toStringValue(
    record.date ??
      toRecord(record.date).S ??
      record.createdAt ??
      toRecord(record.createdAt).S ??
      record.created_at ??
      toRecord(record.created_at).S,
    new Date().toISOString()
  );

  return {
    id,
    chubbyId,
    name,
    mealType,
    calories: Number.isFinite(calories) ? calories : undefined,
    masterId: masterId || undefined,
    masterName: masterName || undefined,
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
    body: {
      ...input,
      // Backward compatibility with existing API field conventions.
      feedType: input.mealType,
      kcal: input.calories,
      masterPersonId: input.masterId,
      masterPersonName: input.masterName
    }
  });

  const created = mapFeed(payload, 0);
  return {
    ...created,
    id: created.id || `feed-${Date.now()}`,
    chubbyId: created.chubbyId || input.chubbyId,
    name: created.name || input.name,
    mealType: created.mealType || input.mealType,
    calories: created.calories ?? input.calories,
    masterId: created.masterId || input.masterId,
    masterName: created.masterName || input.masterName,
    date: created.date || input.date
  };
}

export async function deleteFeedRireki(input: DeleteFeedInput): Promise<void> {
  const sk = input.feedId.startsWith("FEED#") ? input.feedId : `FEED#${input.date}`;
  await request<unknown>("/deleteFeedRireki", {
    method: "POST",
    body: {
      // Preferred payload
      chubbyId: input.chubbyId,
      feedId: input.feedId,
      date: input.date,
      // Backward compatibility aliases
      chubbyPersonId: input.chubbyId,
      id: input.feedId,
      sk
    }
  });
}