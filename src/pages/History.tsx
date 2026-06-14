import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '../db/db';
import { formatDate, formatMinutes } from '../lib/utils';
import { PageShell } from '../components/PageShell';

type Filter = 'all' | 'day-a' | 'day-b';

export function History() {
  const [filter, setFilter] = useState<Filter>('all');
  const [calMonth, setCalMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const sessions = useLiveQuery(() =>
    db.sessions.orderBy('date').reverse().toArray()
  );
  const routines = useLiveQuery(() => db.routines.toArray());

  const filtered = sessions?.filter((s) => {
    if (filter === 'all') return true;
    return s.routineDayId === filter;
  });

  const trainedDays = new Set(sessions?.map((s) => s.date) ?? []);

  const monthStart = startOfMonth(parseISO(`${calMonth}-01`));
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDow = getDay(monthStart); // 0=Sun

  function prevMonth() {
    const d = parseISO(`${calMonth}-01`);
    d.setMonth(d.getMonth() - 1);
    setCalMonth(format(d, 'yyyy-MM'));
  }
  function nextMonth() {
    const d = parseISO(`${calMonth}-01`);
    d.setMonth(d.getMonth() + 1);
    setCalMonth(format(d, 'yyyy-MM'));
  }

  return (
    <PageShell title="Historial">
      {/* Calendar */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-gray-400 active:text-white">‹</button>
          <p className="text-sm font-semibold text-white capitalize">
            {format(monthStart, 'MMMM yyyy', { locale: es })}
          </p>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-gray-400 active:text-white">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => (
            <span key={d} className="text-xs text-gray-500 py-1">{d}</span>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => <span key={`pad-${i}`} />)}
          {days.map((day) => {
            const iso = format(day, 'yyyy-MM-dd');
            const trained = trainedDays.has(iso);
            return (
              <div
                key={iso}
                className={`aspect-square flex items-center justify-center rounded-full text-sm ${
                  trained ? 'bg-indigo-600 text-white font-bold' : 'text-gray-500'
                }`}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'day-a', 'day-b'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'day-a' ? 'Día A' : 'Día B'}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {filtered?.length === 0 && (
          <p className="text-gray-500 text-center py-8">Sin sesiones</p>
        )}
        {filtered?.map((s) => {
          const routine = routines?.find((r) => r.id === s.routineDayId);
          const completedSets = s.sets.filter((set) => set.completed).length;
          const vol = s.sets
            .filter((set) => set.completed)
            .reduce((acc, set) => acc + set.weight * set.reps, 0);

          return (
            <Link
              key={s.id}
              to={`/session/${s.id}/summary`}
              className="block bg-gray-900 rounded-2xl p-4 active:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white text-sm">
                    {routine?.name ?? 'Sesión'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-medium">{vol.toFixed(0)} kg</p>
                  <p className="text-xs text-gray-400">{completedSets} series</p>
                </div>
              </div>
              {s.durationMinutes && (
                <p className="text-xs text-gray-500 mt-1">⏱ {formatMinutes(s.durationMinutes)}</p>
              )}
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
