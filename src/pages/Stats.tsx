import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { db } from '../db/db';
import { e1rm, formatDateShort, movingAverage } from '../lib/utils';
import { PageShell } from '../components/PageShell';

type Tab = 'ejercicio' | 'global' | 'cuerpo' | 'habitos';

export function Stats() {
  const [tab, setTab] = useState<Tab>('ejercicio');

  return (
    <PageShell title="Estadísticas">
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {(['ejercicio', 'global', 'cuerpo', 'habitos'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'ejercicio' && <ExerciseStats />}
      {tab === 'global' && <GlobalStats />}
      {tab === 'cuerpo' && <BodyStats />}
      {tab === 'habitos' && <HabitStats />}
    </PageShell>
  );
}

function ExerciseStats() {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const [selectedId, setSelectedId] = useState<string>('');
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').toArray());

  const selected = exercises?.find((e) => e.id === selectedId) ?? exercises?.[0];

  const chartData = sessions
    ?.filter((s) => s.sets.some((set) => set.exerciseId === (selected?.id ?? '') && set.completed))
    .map((s) => {
      const sets = s.sets.filter((set) => set.exerciseId === selected?.id && set.completed);
      const bestE1rm = Math.max(...sets.map((set) => e1rm(set.weight, set.reps)));
      const volume = sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
      return { date: formatDateShort(s.date), e1rm: bestE1rm, volume };
    }) ?? [];

  const allSets = sessions?.flatMap((s) =>
    s.sets.filter((set) => set.exerciseId === selected?.id && set.completed)
  ) ?? [];
  const bestSet = allSets.reduce<typeof allSets[0] | null>(
    (best, s) => (!best || e1rm(s.weight, s.reps) > e1rm(best.weight, best.reps) ? s : best),
    null
  );

  return (
    <div className="space-y-4">
      <select
        value={selectedId || selected?.id || ''}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {exercises?.map((ex) => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>

      {bestSet && (
        <div className="bg-gray-900 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Mejor set histórico</p>
          <p className="text-2xl font-bold text-white mt-1">
            {bestSet.weight} kg × {bestSet.reps} reps
          </p>
          <p className="text-sm text-indigo-400">e1RM: {e1rm(bestSet.weight, bestSet.reps)} kg</p>
        </div>
      )}

      {chartData.length > 1 && (
        <>
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">e1RM estimado (kg)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="e1rm" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">Volumen por sesión (kg×reps)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                <Bar dataKey="volume" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {chartData.length <= 1 && (
        <p className="text-gray-500 text-center py-8">Necesitas al menos 2 sesiones con este ejercicio</p>
      )}
    </div>
  );
}

function GlobalStats() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').toArray());

  if (!sessions) return null;

  const last12Weeks = sessions.filter((s) => {
    const d = new Date(s.date);
    return d >= new Date(Date.now() - 84 * 86400000);
  });

  const weeklyVolume: Record<string, number> = {};
  last12Weeks.forEach((s) => {
    const week = `S${Math.ceil(new Date(s.date).getDate() / 7)} ${s.date.slice(0, 7)}`;
    weeklyVolume[week] = (weeklyVolume[week] ?? 0) +
      s.sets.filter((set) => set.completed).reduce((acc, set) => acc + set.weight * set.reps, 0);
  });

  const weekData = Object.entries(weeklyVolume).map(([week, vol]) => ({ week, vol }));

  const rirDist = [0, 1, 2, 3, 4].map((rir) => ({
    rir: `RIR ${rir}`,
    count: sessions.flatMap((s) => s.sets).filter((s) => s.completed && s.rir === rir).length,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Sesiones totales</p>
          <p className="text-3xl font-bold text-white">{sessions.length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Últimas 4 sem</p>
          <p className="text-3xl font-bold text-white">
            {sessions.filter((s) => new Date(s.date) >= new Date(Date.now() - 28 * 86400000)).length}
          </p>
        </div>
      </div>

      {weekData.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-3">Volumen semanal (kg)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData}>
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
              <Bar dataKey="vol" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-3">Distribución de RIR</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={rirDist}>
            <XAxis dataKey="rir" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BodyStats() {
  const measurements = useLiveQuery(() => db.measurements.orderBy('date').toArray());

  if (!measurements || measurements.length === 0) {
    return <p className="text-gray-500 text-center py-8">Sin mediciones corporales</p>;
  }

  const weights = measurements.map((m) => m.weight);
  const ma7 = movingAverage(weights, 7);
  const chartData = measurements.map((m, i) => ({
    date: formatDateShort(m.date),
    peso: m.weight,
    media7: Math.round(ma7[i] * 10) / 10,
  }));

  const first = measurements[0].weight;
  const last = measurements[measurements.length - 1].weight;
  const diff = last - first;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{last}</p>
          <p className="text-xs text-gray-400">kg actual</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className={`text-2xl font-bold ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400">cambio total</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{measurements.length}</p>
          <p className="text-xs text-gray-400">registros</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-3">Peso corporal + media 7d (kg)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
            <Line type="monotone" dataKey="peso" stroke="#4b5563" strokeWidth={1} dot={{ r: 2, fill: '#9ca3af' }} />
            <Line type="monotone" dataKey="media7" stroke="#6366f1" strokeWidth={2} dot={false} name="Media 7d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HabitStats() {
  const habits = useLiveQuery(() => db.habits.orderBy('date').reverse().limit(60).toArray());

  if (!habits || habits.length === 0) {
    return <p className="text-gray-500 text-center py-8">Sin registros de hábitos</p>;
  }

  const total = habits.length;
  const morningPct = Math.round((habits.filter((h) => h.morningMobility).length / total) * 100);
  const eveningPct = Math.round((habits.filter((h) => h.eveningStretch).length / total) * 100);
  const avgSnacks = (habits.reduce((acc, h) => acc + h.posturalSnacks, 0) / total).toFixed(1);

  // Streak
  let streak = 0;
  const sorted = [...habits].sort((a, b) => b.date.localeCompare(a.date));
  for (const h of sorted) {
    if (h.morningMobility || h.eveningStretch) streak++;
    else break;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{streak}</p>
          <p className="text-xs text-gray-400">días racha actual</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{avgSnacks}</p>
          <p className="text-xs text-gray-400">snacks/día prom.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Movilidad mañana</span>
            <span className="text-white font-medium">{morningPct}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${morningPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Estiramiento noche</span>
            <span className="text-white font-medium">{eveningPct}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${eveningPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
