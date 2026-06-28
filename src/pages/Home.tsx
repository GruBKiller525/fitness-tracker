import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { BottomNav } from '../components/BottomNav';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '../db/db';
import { generateId, today } from '../lib/utils';

export function Home() {
  const navigate = useNavigate();
  const todayStr = today();

  const routines = useLiveQuery(() => db.routines.toArray());
  const dayARoutine = routines?.find((r) => r.id === 'day-a');
  const dayBRoutine = routines?.find((r) => r.id === 'day-b');

  const weekStart = format(new Date(Date.now() - 6 * 86400000), 'yyyy-MM-dd');
  const allSessions = useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray());
  const allStretchLogs = useLiveQuery(() => db.stretchLogs.orderBy('date').reverse().toArray());
  const weekSessions = allSessions?.filter((s) => s.date >= weekStart);
  const dayACount = weekSessions?.filter((s) => s.routineDayId === 'day-a').length ?? 0;
  const dayBCount = weekSessions?.filter((s) => s.routineDayId === 'day-b').length ?? 0;
  const totalWeek = weekSessions?.length ?? 0;

  // Racha gym: semanas consecutivas con ≥2 sesiones de gym
  const gymStreak = (() => {
    if (!allSessions) return 0;
    let weeks = 0;
    let d = new Date();
    while (true) {
      const weekEnd = format(d, 'yyyy-MM-dd');
      const weekBegin = format(new Date(d.getTime() - 6 * 86400000), 'yyyy-MM-dd');
      const count = allSessions.filter((s) => s.date >= weekBegin && s.date <= weekEnd).length;
      if (count < 2) break;
      weeks++;
      d = new Date(d.getTime() - 7 * 86400000);
    }
    return weeks;
  })();

  // Racha estiramientos: días consecutivos con ≥1 estiramiento
  const stretchStreak = (() => {
    if (!allStretchLogs) return 0;
    const dates = new Set(allStretchLogs.map((l) => l.date));
    let count = 0;
    let d = new Date();
    while (true) {
      const key = format(d, 'yyyy-MM-dd');
      if (!dates.has(key)) break;
      count++;
      d = new Date(d.getTime() - 86400000);
    }
    return count;
  })();

  // Racha deporte: semanas consecutivas con ≥1 sesión (gym o estiramiento)
  const sportStreak = (() => {
    if (!allSessions || !allStretchLogs) return 0;
    const allDates = new Set([
      ...allSessions.map((s) => s.date),
      ...allStretchLogs.map((l) => l.date),
    ]);
    let weeks = 0;
    let d = new Date();
    while (true) {
      const weekEnd = format(d, 'yyyy-MM-dd');
      const weekBegin = format(new Date(d.getTime() - 6 * 86400000), 'yyyy-MM-dd');
      const hasActivity = [...allDates].some((date) => date >= weekBegin && date <= weekEnd);
      if (!hasActivity) break;
      weeks++;
      d = new Date(d.getTime() - 7 * 86400000);
    }
    return weeks;
  })();

  async function startSession(routineId: string) {
    const id = generateId();
    await db.sessions.put({
      id,
      date: todayStr,
      routineDayId: routineId,
      energy: 3,
      sleepHours: 7,
      sets: [],
    });
    navigate(`/session/${id}`);
  }

  const dayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col min-h-svh bg-gray-950 relative pb-20">
      <img
        src="/fondo_home.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none z-0"
      />
      <div className="relative z-10 flex flex-col flex-1">
      {/* Header */}
      <div className="relative overflow-hidden">
        <img
          src="/vegeta_banner.png"
          alt=""
          className="absolute right-0 top-0 h-24 w-auto opacity-40 pointer-events-none select-none object-contain object-right-top"
        />
        <div className="px-4 pt-6 pb-4 relative z-10">
          <p className="text-orange-400 text-sm capitalize font-medium">{dayLabel}</p>
          <h1 className="text-3xl font-black text-white mt-0.5 tracking-tight">
            ¡A entrenar, guerrero! ⚡
          </h1>
          <p className="text-gray-500 text-xs mt-1">El poder se forja en el esfuerzo</p>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Estiramientos button - always visible */}
        <button
          onClick={() => navigate('/stretch')}
          className="w-full rounded-xl overflow-hidden relative active:opacity-70 transition-opacity border border-orange-500/50 shadow-lg shadow-black/30"
        >
          <img src="/boton_saibaiman.png" alt="Estiramientos" className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/15 flex items-end p-2">
            <span className="text-white text-sm font-bold drop-shadow">Estiramientos</span>
          </div>
        </button>

        {/* Deporte button */}
        <button
          onClick={async () => {
            await db.sessions.put({ id: generateId(), date: todayStr, routineDayId: 'sport', energy: 3, sleepHours: 7, sets: [] });
          }}
          className="w-full rounded-xl overflow-hidden relative active:opacity-70 transition-opacity border border-orange-500/50 shadow-lg shadow-black/30"
        >
          <img src="/boton_deporte.png" alt="Deporte" className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/15 flex items-end p-2">
            <span className="text-white text-sm font-bold drop-shadow">Registrar deporte</span>
          </div>
        </button>

        {/* Session image buttons */}
        <div className="flex gap-2">
          {dayARoutine && (
            <button
              onClick={() => startSession('day-a')}
              className="flex-1 rounded-xl overflow-hidden relative active:opacity-70 transition-opacity border border-orange-500/50 shadow-lg shadow-black/30"
            >
              <img src="/BotonSesionA_Raditz.png" alt="Día A" className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/15 flex items-end p-2">
                <span className="text-white text-sm font-bold drop-shadow">Día A</span>
              </div>
            </button>
          )}
          {dayBRoutine && (
            <button
              onClick={() => startSession('day-b')}
              className="flex-1 rounded-xl overflow-hidden relative active:opacity-70 transition-opacity border border-orange-500/50 shadow-lg shadow-black/30"
            >
              <img src="/BotonSesionB_Nappa.png" alt="Día B" className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/15 flex items-end p-2">
                <span className="text-white text-sm font-bold drop-shadow">Día B</span>
              </div>
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sesiones semana */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-2">Últimos 7 días</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Día A</span>
                <span className="text-sm font-bold text-orange-400">{dayACount}x</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Día B</span>
                <span className="text-sm font-bold text-orange-400">{dayBCount}x</span>
              </div>
              <div className="border-t border-gray-700 pt-1.5 flex items-center justify-between">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-sm font-bold text-white">{totalWeek} sesiones</span>
              </div>
            </div>
          </div>

          {/* Rachas */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-2">Rachas</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">🏋️ Gym</span>
                <span className="text-sm font-bold text-orange-400">{gymStreak} sem</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">🧘 Estiram.</span>
                <span className="text-sm font-bold text-orange-400">{stretchStreak} días</span>
              </div>
              <div className="border-t border-gray-700 pt-1.5 flex items-center justify-between">
                <span className="text-xs text-gray-400">⚡ Deporte</span>
                <span className="text-sm font-bold text-white">{sportStreak} sem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner entrenamiento diario */}
        <div className="rounded-2xl overflow-hidden relative">
          <img
            src="/banner_entrenamiento.png"
            alt="Entrenamiento diario"
            className="w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
