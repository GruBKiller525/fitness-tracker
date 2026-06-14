import { db } from '../db/db';
import type { AppExport } from '../db/types';

export async function exportData(): Promise<void> {
  const [exercises, routines, sessions, measurements, habits] = await Promise.all([
    db.exercises.toArray(),
    db.routines.toArray(),
    db.sessions.toArray(),
    db.measurements.toArray(),
    db.habits.toArray(),
  ]);

  const data: AppExport = {
    exercises,
    routines,
    sessions,
    measurements,
    habits,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fittracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isAppExport(obj: unknown): obj is AppExport {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    Array.isArray(o.exercises) &&
    Array.isArray(o.routines) &&
    Array.isArray(o.sessions) &&
    Array.isArray(o.measurements) &&
    Array.isArray(o.habits)
  );
}

export async function importData(file: File, mode: 'replace' | 'merge'): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as unknown;

  if (!isAppExport(data)) {
    throw new Error('El archivo no tiene el formato correcto.');
  }

  if (mode === 'replace') {
    await db.transaction('rw', [db.exercises, db.routines, db.sessions, db.measurements, db.habits], async () => {
      await db.exercises.clear();
      await db.routines.clear();
      await db.sessions.clear();
      await db.measurements.clear();
      await db.habits.clear();
      await db.exercises.bulkPut(data.exercises);
      await db.routines.bulkPut(data.routines);
      await db.sessions.bulkPut(data.sessions);
      await db.measurements.bulkPut(data.measurements);
      await db.habits.bulkPut(data.habits);
    });
  } else {
    await db.transaction('rw', [db.exercises, db.routines, db.sessions, db.measurements, db.habits], async () => {
      await db.exercises.bulkPut(data.exercises);
      await db.routines.bulkPut(data.routines);
      await db.sessions.bulkPut(data.sessions);
      await db.measurements.bulkPut(data.measurements);
      await db.habits.bulkPut(data.habits);
    });
  }
}
