import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import axios from 'axios';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { WeaknessCard } from '@/components/dashboard/WeaknessCard';
import { TodaysRevision } from '@/components/dashboard/TodaysRevision';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  RotateCcw, 
  Tags, 
  TrendingUp,
  Calendar,
  BarChart3,
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/dashboard', {
          baseURL: 'http://localhost:8000',
          params: { user_id: user.uid }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data</h2>
            <p className="text-gray-600 dark:text-gray-400">No dashboard data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { basic_stats, weaknesses, todays_revision, activity_heatmap, recent_activity } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            📊 Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your LeetSpace learning analytics and insights
          </p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Problems"
            value={basic_stats.total_problems}
            subtitle="Problems logged"
            icon={FileText}
          />
          <StatCard
            title="Retry Later"
            value={basic_stats.retry_count}
            subtitle="Need review"
            icon={RotateCcw}
          />
          <StatCard
            title="Active Days"
            value={basic_stats.total_active_days}
            subtitle="Days with activity"
            icon={Calendar}
          />
          <StatCard
            title="Difficulty"
            value={`${basic_stats.difficulty_breakdown.easy}E | ${basic_stats.difficulty_breakdown.medium}M | ${basic_stats.difficulty_breakdown.hard}H`}
            subtitle="Easy | Medium | Hard"
            icon={BarChart3}
          />
        </div>

        {/* Most Used Tags */}
        {basic_stats.most_used_tags.length > 0 && (
          <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Most Used Tags</h2>
            <div className="flex flex-wrap gap-2">
              {basic_stats.most_used_tags.map(({ tag, count }) => (
                <Badge key={tag} variant="secondary" className="text-sm bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-zinc-700 transition-colors border border-gray-200 dark:border-zinc-700">
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <WeaknessCard weaknesses={weaknesses} />
            <TodaysRevision revision={todays_revision} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RecentActivity activities={recent_activity} />
          </div>
        </div>

        {/* Activity Heatmap - Full Width */}
        <ActivityHeatmap data={activity_heatmap} />
      </div>
    </div>
  );
}