import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

type Props = {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
  noNav?: boolean;
};

export function PageShell({ children, title, headerRight, noNav }: Props) {
  return (
    <div className="flex flex-col min-h-svh pb-[64px]">
      {title && (
        <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white m-0">{title}</h1>
          {headerRight && <div>{headerRight}</div>}
        </header>
      )}
      <main className="flex-1 px-4 py-4">{children}</main>
      {!noNav && <BottomNav />}
    </div>
  );
}
