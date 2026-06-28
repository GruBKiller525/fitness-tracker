import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { secondsToMMSS } from '../lib/utils';

export function StretchList() {
  const navigate = useNavigate();
  const order = ['stretch-postural', 'stretch-morning', 'stretch-evening', 'stretch-postworkout'];
  const routines = useLiveQuery(async () => {
    const all = await db.stretchRoutines.toArray();
    return all.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  });

  const total = (exercises: { durationSeconds: number }[]) =>
    exercises.reduce((a, b) => a + b.durationSeconds, 0);

  return (
    <div className="min-h-svh bg-gray-950 flex flex-col relative">
      <img src="/fondo_stretch.png" alt="" className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none z-0" />
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-2 py-3 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-orange-400 text-2xl"
        >
          ‹
        </button>
        <h1 className="text-lg font-semibold text-white flex-1">Estiramientos</h1>
      </header>

      <div className="px-4 py-6 space-y-3">
        {!routines ? (
          <p className="text-gray-400 text-center">Cargando…</p>
        ) : routines.length === 0 ? (
          <p className="text-gray-400 text-center">No hay rutinas disponibles</p>
        ) : (
          routines.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/stretch/${r.id}`)}
              className="w-full bg-gray-900 rounded-2xl p-4 flex items-center gap-4 active:bg-gray-800 transition-colors text-left"
            >
              <img src={icon(r.id)} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base">{r.name}</p>
                {r.description && (
                  <p className="text-gray-400 text-sm truncate mt-0.5">{r.description}</p>
                )}
                <div className="flex gap-3 mt-1">
                  <span className="text-orange-400 text-xs font-semibold">{r.exercises.length} ejercicios</span>
                  <span className="text-gray-500 text-xs">{secondsToMMSS(total(r.exercises))}</span>
                </div>
              </div>
              <span className="text-orange-400 text-2xl flex-shrink-0">›</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function icon(id: string) {
  if (id === 'stretch-morning') return '/Saibaiman1.png';
  if (id === 'stretch-evening') return '/Saibaiman2.png';
  if (id === 'stretch-postworkout') return '/Saibaiman3.png';
  if (id === 'stretch-postural') return '/snackpostural.png';
  return '/Saibaiman1.png';
}
