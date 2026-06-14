import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/history', label: 'Historial', icon: '📋' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/body', label: 'Cuerpo', icon: '📏' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gray-900 border-t border-gray-700 flex z-50">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
              isActive ? 'text-orange-400' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
