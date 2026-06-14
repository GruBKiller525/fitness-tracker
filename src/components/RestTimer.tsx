import { useEffect, useRef, useState } from 'react';
import { secondsToMMSS } from '../lib/utils';

type Props = {
  seconds: number;
  onDone: () => void;
};

export function RestTimer({ seconds, onDone }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const doneRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onDone]);

  const pct = (remaining / seconds) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/90 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-8 mx-4 text-center w-full max-w-xs">
        <p className="text-gray-400 text-sm mb-2">Descanso</p>
        <div className="text-6xl font-bold text-white mb-4 tabular-nums">
          {secondsToMMSS(remaining)}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          onClick={onDone}
          className="w-full py-3 bg-gray-700 rounded-xl text-white font-medium"
        >
          Saltar
        </button>
      </div>
    </div>
  );
}
