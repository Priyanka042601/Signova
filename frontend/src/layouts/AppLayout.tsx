import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MobileNav } from '../components/MobileNav';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { api } from '../services/apiClient';
import { DashboardSummary } from '../types/api';

import { useAuth } from '../auth/ClerkAuthProvider';

export const AppLayout: React.FC = () => {
  const { userId, isSignedIn } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.warn("Could not fetch dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, userId, isSignedIn]);

  return (
    <div className="min-h-screen bg-cloud flex flex-col md:flex-row font-sans">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header dashboardData={dashboardData} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            <div key={location.pathname} className="animate-fade-in">
              <Outlet context={{ refreshStats: fetchStats, dashboardData, loading }} />
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
