import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AthleteProvider } from './context/AthleteContext';
import useAthlete from './hooks/useAthlete';
import Navbar from './components/layout/Navbar';
import PageContainer from './components/layout/PageContainer';
import OnboardingPage from './pages/OnboardingPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import TimelinePage from './pages/TimelinePage';
import GraphPage from './pages/GraphPage';

function AppRoutes() {
  const { athleteId } = useAthlete();

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
        {athleteId && <Navbar />}
        <PageContainer>
          <Routes>
            <Route path="/" element={<OnboardingPage />} />
            <Route path="/chat" element={athleteId ? <ChatPage /> : <Navigate to="/" replace />} />
            <Route path="/dashboard" element={athleteId ? <DashboardPage /> : <Navigate to="/" replace />} />
            <Route path="/timeline" element={athleteId ? <TimelinePage /> : <Navigate to="/" replace />} />
            <Route path="/graph" element={athleteId ? <GraphPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageContainer>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AthleteProvider>
      <AppRoutes />
    </AthleteProvider>
  );
}
