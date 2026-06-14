import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { e1rm, formatDate, formatMinutes } from '../lib/utils';
import { getNotionConfig, sendSessionToNotion } from '../lib/notion';

export function SessionSummary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notionStatus, setNotionStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [notionError, setNotionError] = useState('');

  const session = useLiveQuery(() => (id ? db.sessions.get(id) : undefined), [id]);
  const routine = useLiveQuery(
    () => (session ? db.routines.get(session.routineDayId) : undefined),
    [session?.routineDayId]
  );
  const exercises = useLiveQuery(() => db.exercises.toArray());

  if (!session || !routine || !exercises) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-950">
        <p className="text-gray-400">Cargando…</p>
      </div>
    );
  }

  const completedSets = session.sets.filter((s) => s.completed);
  const totalVolume = completedSets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  const totalTarget = routine.exercises.reduce((acc, re) => acc + re.targetSets, 0);

  // Group by exercise
  const byExercise = exercises
    .filter((ex) => session.sets.some((s) => s.exerciseId === ex.id))
    .map((ex) => {
      const sets = completedSets.filter((s) => s.exerciseId === ex.id);
      const bestE1rm = Math.max(...sets.map((s) => e1rm(s.weight, s.reps)), 0);
      return { ex, sets, bestE1rm };
    });

  async function sendToNotion() {
    const config = getNotionConfig();
    if (!config) {
      setNotionError('Configura Notion en Ajustes primero');
      setNotionStatus('error');
      return;
    }
    setNotionStatus('sending');
    try {
      await sendSessionToNotion(config, {
        sessionDate: session!.date,
        routineName: routine!.name,
        durationMinutes: session!.durationMinutes,
        energy: session!.energy,
        sleepHours: session!.sleepHours,
        totalVolume,
        completedSets: completedSets.length,
        targetSets: totalTarget,
        bodyweight: session!.bodyweight,
        exercises: byExercise.map(({ ex, sets, bestE1rm }) => ({
          exerciseName: ex.name,
          sets: sets.map((s) => ({ weight: s.weight, reps: s.reps, rir: s.rir })),
          bestE1rm,
        })),
        notes: session!.notes,
      });
      setNotionStatus('ok');
    } catch (err) {
      setNotionError((err as Error).message);
      setNotionStatus('error');
    }
  }

  async function share() {
    const text = [
      `💪 Entreno: ${routine?.name}`,
      `📅 ${formatDate(session!.date)}`,
      `⏱ ${session?.durationMinutes ? formatMinutes(session.durationMinutes) : '—'}`,
      `🏋️ Volumen: ${totalVolume.toFixed(0)} kg`,
      `✅ ${completedSets.length}/${totalTarget} series`,
    ].join('\n');

    if (navigator.share) {
      await navigator.share({ title: 'Mi entrenamiento', text });
    }
  }

  return (
    <div className="min-h-svh bg-gray-950 pb-8">
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Resumen</h1>
        <Link to="/" className="text-sm text-orange-400">Inicio</Link>
      </header>

      <div className="px-4 pt-6 space-y-4">
        <div>
          <p className="text-gray-400 text-sm">{formatDate(session.date)}</p>
          <p className="text-xl font-bold text-white">{routine.name}</p>
          {session.durationMinutes && (
            <p className="text-sm text-gray-400">Duración: {formatMinutes(session.durationMinutes)}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{totalVolume.toFixed(0)}</p>
            <p className="text-xs text-gray-400">kg totales</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{completedSets.length}</p>
            <p className="text-xs text-gray-400">de {totalTarget} series</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{session.energy}</p>
            <p className="text-xs text-gray-400">energía /5</p>
          </div>
        </div>

        {/* By exercise */}
        <div className="space-y-3">
          {byExercise.map(({ ex, sets, bestE1rm }) => (
            <div key={ex.id} className="bg-gray-900 rounded-2xl p-4">
              <p className="font-semibold text-white text-sm">{ex.name}</p>
              <div className="mt-2 space-y-1">
                {sets.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">Serie {s.setNumber}</span>
                    <span className="text-white font-medium">
                      {s.weight} kg × {s.reps} reps · RIR {s.rir}
                    </span>
                  </div>
                ))}
              </div>
              {bestE1rm > 0 && (
                <p className="text-xs text-orange-400 mt-2">e1RM estimado: {bestE1rm} kg</p>
              )}
            </div>
          ))}
        </div>

        {/* Notion */}
        {notionStatus === 'ok' ? (
          <div className="w-full py-4 bg-green-900/30 border border-green-700 rounded-2xl text-center">
            <p className="text-green-400 font-semibold">✓ Enviado a Notion</p>
          </div>
        ) : (
          <button
            onClick={sendToNotion}
            disabled={notionStatus === 'sending'}
            className="w-full py-4 bg-gray-800 rounded-2xl text-white font-semibold active:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>📓</span>
            {notionStatus === 'sending' ? 'Enviando…' : 'Enviar a Notion'}
          </button>
        )}
        {notionStatus === 'error' && (
          <p className="text-red-400 text-sm text-center -mt-2">{notionError}</p>
        )}

        {'share' in navigator && (
          <button
            onClick={share}
            className="w-full py-4 bg-gray-800 rounded-2xl text-white font-semibold active:bg-gray-700"
          >
            Compartir resumen
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-orange-600 rounded-2xl text-white font-semibold active:bg-indigo-700"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
