import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';

type Props = {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
  noNav?: boolean;
  showBack?: boolean;
};

export function PageShell({ children, title, headerRight, noNav, showBack = true }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-svh pb-[64px]">
      {title && (
        <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-2 py-3 flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-orange-400 text-2xl active:text-orange-300 flex-shrink-0"
            >
              ‹
            </button>
          )}
          <h1 className="text-lg font-semibold text-white flex-1">{title}</h1>
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </header>
      )}
      <main className="flex-1 px-4 py-4">{children}</main>
      {!noNav && <BottomNav />}
    </div>
  );
}
