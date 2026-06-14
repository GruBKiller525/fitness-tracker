import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { exportData, importData } from '../lib/exportImport';
import { generateId } from '../lib/utils';
import { getNotionConfig, saveNotionConfig, clearNotionConfig } from '../lib/notion';
import type { Exercise, MuscleGroup } from '../db/types';
import { PageShell } from '../components/PageShell';

const muscleGroups: MuscleGroup[] = [
  'pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps', 'gluteo', 'core', 'cardio',
];

export function Settings() {
  const [section, setSection] = useState<'main' | 'exercises' | 'routines'>('main');
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState('');

  const existingNotion = getNotionConfig();
  const [notionToken, setNotionToken] = useState(existingNotion?.token ?? '');
  const [notionDbId, setNotionDbId] = useState(existingNotion?.databaseId ?? '');
  const [notionSaved, setNotionSaved] = useState(!!existingNotion);

  function saveNotion() {
    if (!notionToken.trim() || !notionDbId.trim()) return;
    saveNotionConfig({ token: notionToken.trim(), databaseId: notionDbId.trim() });
    setNotionSaved(true);
    setMsg('Notion conectado ✓');
  }

  function disconnectNotion() {
    clearNotionConfig();
    setNotionToken('');
    setNotionDbId('');
    setNotionSaved(false);
    setMsg('Notion desconectado');
  }

  async function handleImport(file: File) {
    try {
      await importData(file, importMode);
      setMsg('Importación completada ✓');
    } catch (e) {
      setMsg(`Error: ${(e as Error).message}`);
    }
  }

  async function deleteAll() {
    await db.sessions.clear();
    await db.measurements.clear();
    await db.habits.clear();
    setConfirmDelete(false);
    setMsg('Datos de entrenos eliminados ✓');
  }

  if (section === 'exercises') return <ExerciseCatalog onBack={() => setSection('main')} />;

  return (
    <PageShell title="Ajustes">
      {msg && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-3 mb-4">
          <p className="text-green-400 text-sm">{msg}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => setSection('exercises')}
          className="w-full py-4 bg-gray-800 rounded-2xl text-white text-left px-5 active:bg-gray-700"
        >
          📚 Catálogo de ejercicios
        </button>

        {/* Notion */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-300">Notion</p>
            {notionSaved && (
              <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">Conectado</span>
            )}
          </div>
          {!notionSaved ? (
            <>
              <p className="text-xs text-gray-500">
                1. Ve a notion.so/my-integrations → crea una integración{'\n'}
                2. Crea una base de datos en Notion y conéctala a la integración{'\n'}
                3. Pega aquí el token y el ID de la base de datos
              </p>
              <input
                type="password"
                placeholder="Token (secret_xxx…)"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="ID de base de datos"
                value={notionDbId}
                onChange={(e) => setNotionDbId(e.target.value)}
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={saveNotion}
                className="w-full py-3 bg-indigo-600 rounded-xl text-white font-medium active:bg-indigo-700"
              >
                Guardar configuración
              </button>
            </>
          ) : (
            <button
              onClick={disconnectNotion}
              className="w-full py-3 bg-gray-700 rounded-xl text-gray-300 text-sm active:bg-gray-600"
            >
              Desconectar Notion
            </button>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-300">Exportar / Importar datos</p>
          <button
            onClick={exportData}
            className="w-full py-3 bg-indigo-700 rounded-xl text-white font-medium active:bg-indigo-600"
          >
            Exportar JSON
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('merge')}
              className={`flex-1 py-2 rounded-xl text-sm ${importMode === 'merge' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Merge
            </button>
            <button
              onClick={() => setImportMode('replace')}
              className={`flex-1 py-2 rounded-xl text-sm ${importMode === 'replace' ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Reemplazar
            </button>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 bg-gray-700 rounded-xl text-white font-medium active:bg-gray-600"
          >
            Importar JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-red-400">Zona peligrosa</p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-3 bg-red-900/30 border border-red-700 rounded-xl text-red-400 active:bg-red-900/50"
            >
              Borrar sesiones y mediciones
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-300">¿Seguro? Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button onClick={deleteAll} className="flex-1 py-3 bg-red-700 rounded-xl text-white font-bold active:bg-red-600">
                  Sí, borrar
                </button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 bg-gray-700 rounded-xl text-white active:bg-gray-600">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">FitTracker — datos locales, sin cuenta</p>
          <p className="text-xs text-gray-600 mt-1">v1.0.0</p>
        </div>
      </div>
    </PageShell>
  );
}

function ExerciseCatalog({ onBack }: { onBack: () => void }) {
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray());
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', muscleGroup: 'pecho' as MuscleGroup, type: 'compound' as Exercise['type'], imageUrl: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');

  async function saveExercise() {
    if (!form.name.trim()) return;
    const { imageUrl, ...rest } = form;
    await db.exercises.put({ id: generateId(), ...rest, ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}) });
    setForm({ name: '', muscleGroup: 'pecho', type: 'compound', imageUrl: '' });
    setShowNew(false);
  }

  async function saveImageUrl(id: string) {
    await db.exercises.update(id, { imageUrl: editImageUrl.trim() || undefined });
    setEditingId(null);
  }

  async function deleteExercise(id: string) {
    await db.exercises.delete(id);
  }

  return (
    <div className="min-h-svh bg-gray-950 pb-8">
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-indigo-400 text-lg">‹</button>
        <h1 className="text-lg font-semibold text-white">Ejercicios</h1>
      </header>
      <div className="px-4 pt-4 space-y-3">
        <button
          onClick={() => setShowNew(!showNew)}
          className="w-full py-3 bg-indigo-600 rounded-xl text-white font-medium active:bg-indigo-700"
        >
          + Nuevo ejercicio
        </button>

        {showNew && (
          <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
            <input
              placeholder="Nombre del ejercicio"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={form.muscleGroup}
              onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value as MuscleGroup }))}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {muscleGroups.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex gap-2">
              {(['compound', 'isolation'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-xl text-sm ${form.type === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              placeholder="URL imagen / GIF (opcional)"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {form.imageUrl.trim() && (
              <img src={form.imageUrl} alt="preview" className="w-full max-h-40 object-contain rounded-xl bg-gray-800" />
            )}
            <button onClick={saveExercise} className="w-full py-3 bg-indigo-600 rounded-xl text-white font-semibold active:bg-indigo-700">
              Guardar
            </button>
          </div>
        )}

        {exercises?.map((ex) => (
          <div key={ex.id} className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {ex.imageUrl ? (
                  <img src={ex.imageUrl} alt={ex.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-800" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-xs">IMG</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ex.name}</p>
                  <p className="text-xs text-gray-500">{ex.muscleGroup} · {ex.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => { setEditingId(editingId === ex.id ? null : ex.id); setEditImageUrl(ex.imageUrl ?? ''); }}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 active:text-white text-lg"
                >
                  🖼
                </button>
                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-500 active:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
            {editingId === ex.id && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-800 pt-3">
                <input
                  placeholder="Pega URL de imagen o GIF"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                {editImageUrl.trim() && (
                  <img src={editImageUrl} alt="preview" className="w-full max-h-40 object-contain rounded-xl bg-gray-800" />
                )}
                <div className="flex gap-2">
                  <button onClick={() => saveImageUrl(ex.id)} className="flex-1 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium active:bg-indigo-700">
                    Guardar
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-gray-700 rounded-xl text-gray-300 text-sm active:bg-gray-600">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
