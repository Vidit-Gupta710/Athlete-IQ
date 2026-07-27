import React, { useEffect, useState } from 'react';
import useAthlete from '../hooks/useAthlete';
import { getAthleteDashboard } from '../api/athlete';
import StatCard from '../components/dashboard/StatCard';
import InjuryCard from '../components/dashboard/InjuryCard';
import AlertCard from '../components/dashboard/AlertCard';
import { 
  Activity, 
  TrendingUp, 
  Heart,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { athleteId } = useAthlete();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAthleteDashboard(athleteId);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve your athlete metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (athleteId) {
      fetchDashboardData();
    }
  }, [athleteId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Syncing dashboard vitals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-sm mx-auto text-center gap-4">
        <div className="p-4 rounded-full bg-red-955/20 border border-red-900/50 text-red-400 text-lg">
          ⚠️
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Metrics Sync Failed</h3>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-emerald-400 text-sm font-semibold tracking-wider transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Sync</span>
        </button>
      </div>
    );
  }

  const { metrics, injuries, alerts } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-theme-heading tracking-tight">Athlete Vitals</h1>
          <p className="text-sm text-theme-muted font-medium mt-1">Real-time load limits, alerts and injury indices</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="self-start flex items-center gap-1.5 px-3.5 py-2 neu-button text-theme-muted hover:text-theme-primary text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3 text-theme-primary" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          title="Training Volume" 
          value={metrics?.trainingLoad || '0%'} 
          icon={Activity} 
          trend="Calculated weekly capacity"
          colorClass="text-indigo-400 border-indigo-900/40"
        />
        <StatCard 
          title="Recovery Score" 
          value={metrics?.recoveryScore || '100%'} 
          icon={TrendingUp} 
          trend="Cardiac & soreness delta"
          colorClass="text-emerald-400 border-emerald-900/40"
        />
        <StatCard 
          title="Active Limitations" 
          value={metrics?.activeInjuriesCount || 0} 
          icon={Heart} 
          trend="Injury tracking capacity"
          colorClass="text-amber-500 border-amber-900/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <InjuryCard injuries={injuries} />
        <AlertCard alerts={alerts} />
      </div>
    </div>
  );
}
