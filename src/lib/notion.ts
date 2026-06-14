export type NotionConfig = {
  token: string;
  databaseId: string;
};

export type NotionSessionPayload = {
  sessionDate: string;
  routineName: string;
  durationMinutes?: number;
  energy: number;
  sleepHours: number;
  totalVolume: number;
  completedSets: number;
  targetSets: number;
  bodyweight?: number;
  exercises: {
    exerciseName: string;
    sets: { weight: number; reps: number; rir: number }[];
    bestE1rm: number;
  }[];
  notes?: string;
};

const STORAGE_KEY = 'notion_config';

export function getNotionConfig(): NotionConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotionConfig) : null;
  } catch {
    return null;
  }
}

export function saveNotionConfig(config: NotionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearNotionConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function sendSessionToNotion(
  config: NotionConfig,
  payload: NotionSessionPayload
): Promise<string> {
  const res = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: config.token,
      databaseId: config.databaseId,
      payload,
    }),
  });

  const data = (await res.json()) as { url?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `Error ${res.status}`);
  }

  return data.url ?? '';
}
