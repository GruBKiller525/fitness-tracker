import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { seedIfEmpty } from './db/seed';
import { Home } from './pages/Home';
import { Session } from './pages/Session';
import { SessionSummary } from './pages/SessionSummary';
import { History } from './pages/History';
import { Stats } from './pages/Stats';
import { Body } from './pages/Body';
import { Guide } from './pages/Guide';
import { Settings } from './pages/Settings';
import { StretchGuide } from './pages/StretchGuide';
import { StretchList } from './pages/StretchList';

export default function App() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session/:id" element={<Session />} />
        <Route path="/session/:id/summary" element={<SessionSummary />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/body" element={<Body />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/stretch" element={<StretchList />} />
        <Route path="/stretch/:id" element={<StretchGuide />} />
      </Routes>
    </BrowserRouter>
  );
}
