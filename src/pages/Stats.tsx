import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { db } from '../db/db';
import { e1rm, formatDateShort } from '../lib/utils';
import { PageShell } from '../components/PageShell';
import { format, startOfWeek, addDays } from 'date-fns';

type Tab = 'ejercicio' | 'actividad';

export function Stats() {
  const [tab, setTab] = useState<Tab>('ejercicio');

  const labels: Record<Tab, string> = { ejercicio: 'Ejercicio', actividad: 'Actividad' };

  return (
    <PageShell title="Estadísticas">
      <div className="flex gap-1 mb-4">
        {(['ejercicio', 'actividad'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      {tab === 'ejercicio' && <ExerciseStats />}
      {tab === 'actividad' && <ActivityStats />}
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
        className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-base focus:outline-none"
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
          <p className="text-sm text-orange-400">e1RM: {e1rm(bestSet.weight, bestSet.reps)} kg</p>
        </div>
      )}

      {chartData.length > 1 ? (
        <>
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">e1RM estimado (kg)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="e1rm" stroke="#f97316" strokeWidth={2} dot={false} />
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
                <Bar dataKey="volume" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">Necesitas al menos 2 sesiones con este ejercicio</p>
      )}
    </div>
  );
}

function ActivityStats() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').toArray());
  const stretchLogs = useLiveQuery(() => db.stretchLogs.orderBy('date').toArray());

  if (!sessions || !stretchLogs) return null;

  const weekData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(addDays(new Date(), -(7 * (7 - i))), { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const label = format(weekStart, 'dd/MM');
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');

    const gym = sessions.filter((s) =>
      (s.routineDayId === 'day-a' || s.routineDayId === 'day-b') &&
      s.date >= startStr && s.date <= endStr
    ).length;
    const sport = sessions.filter((s) =>
      s.routineDayId === 'sport' && s.date >= startStr && s.date <= endStr
    ).length;
    const stretch = stretchLogs.filter((l) =>
      l.date >= startStr && l.date <= endStr
    ).length;

    return { label, gym, sport, stretch };
  });

  const totalGym = sessions.filter((s) => s.routineDayId === 'day-a' || s.routineDayId === 'day-b').length;
  const totalSport = sessions.filter((s) => s.routineDayId === 'sport').length;
  const totalStretch = stretchLogs.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-orange-400">{totalGym}</p>
          <p className="text-xs text-gray-400 mt-0.5">Gym</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-blue-400">{totalSport}</p>
          <p className="text-xs text-gray-400 mt-0.5">Deporte</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-green-400">{totalStretch}</p>
          <p className="text-xs text-gray-400 mt-0.5">Estiram.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-3">Actividad por semana (últimas 8)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData} barSize={8}>
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <Bar dataKey="gym" name="Gym" fill="#f97316" radius={[3, 3, 0, 0]} />
            <Bar dataKey="sport" name="Deporte" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="stretch" name="Estiram." fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-2">Últimas 4 semanas</p>
        <div className="space-y-2">
          {[
            { label: 'Sesiones gym', value: sessions.filter((s) => (s.routineDayId === 'day-a' || s.routineDayId === 'day-b') && s.date >= format(addDays(new Date(), -28), 'yyyy-MM-dd')).length, color: 'text-orange-400' },
            { label: 'Sesiones deporte', value: sessions.filter((s) => s.routineDayId === 'sport' && s.date >= format(addDays(new Date(), -28), 'yyyy-MM-dd')).length, color: 'text-blue-400' },
            { label: 'Estiramientos', value: stretchLogs.filter((l) => l.date >= format(addDays(new Date(), -28), 'yyyy-MM-dd')).length, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{label}</span>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
