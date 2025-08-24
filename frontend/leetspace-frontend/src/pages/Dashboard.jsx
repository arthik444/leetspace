import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/context/DemoContext";
import { analyticsAPI, problemsAPI } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { WeaknessCard } from '@/components/dashboard/WeaknessCard';
import { TodaysRevision } from '@/components/dashboard/TodaysRevision';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  RotateCcw, 
  Target, 
  Tags, 
  TrendingUp,
  Calendar,
  BarChart3,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    if (!user && !isDemo) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await analyticsAPI.getDashboard();
      setData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, isDemo]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleAddProblem = () => {
    navigate('/add-problem');
  };

  const handleViewAllProblems = () => {
    navigate('/problems');
  };

  const handleViewRetryProblems = () => {
    navigate('/problems?filter=retry');
  };

  const handleViewProblemsByTag = (tag) => {
    navigate(`/problems?tag=${tag}`);
  };

  const handleViewProblemsByWeakness = (tag) => {
    navigate(`/problems?tag=${tag}&filter=weakness`);
  };

  const handleRevisionUpdate = async (updatedProblem) => {
    try {
      // Update the problem in the local state immediately for responsive UI
      if (data && data.todays_revision && data.todays_revision.id === updatedProblem.id) {
        setData(prevData => ({
          ...prevData,
          todays_revision: updatedProblem
        }));
      }

      // Update the problem in the backend
      if (!isDemo) {
        // Extract only the spaced repetition data to send to backend
        const updateData = {
          spaced_repetition: updatedProblem.spaced_repetition
        };
        
        // Debug logging
        await problemsAPI.updateProblem(updatedProblem.id, updateData);
      } else {
        // Demo mode: just log the update
      }
    } catch (error) {
      console.error('❌ Failed to update spaced repetition data:', error);
      
      // Show error toast
      toast.error('Failed to save revision progress. Please try again.');
      
      // Revert local state change on error
      if (data && data.todays_revision && data.todays_revision.id === updatedProblem.id) {
        setData(prevData => ({
          ...prevData,
          todays_revision: data.todays_revision // Revert to original
        }));
      }
    }
  };

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

  const { basic_stats, weaknesses, todays_revision, todays_revision_locked = false, activity_heatmap, recent_activity } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hi {user?.displayName?.trim() || (user?.email ? user.email.split('@')[0] : (isDemo ? 'demo explorer' : 'there'))}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your LeetSpace learning analytics and insights {isDemo && '(demo)'}
          </p>
          {basic_stats.total_problems > 0 && (
            <div className="pt-2">
              <Button
                onClick={handleAddProblem}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Problem
              </Button>
            </div>
          )}
        </div>

        {/* Zero-state suggestion */}
        {basic_stats.total_problems === 0 && (
          <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">No problems yet</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Log your first problem to start your journal.</div>
            </div>
            <Button onClick={handleAddProblem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Problem
            </Button>
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Problems"
            value={basic_stats.total_problems}
            subtitle="Problems logged"
            icon={FileText}
            onClick={handleViewAllProblems}
          />
          <StatCard
            title="Retry Later"
            value={basic_stats.retry_count}
            subtitle="Need review"
            icon={RotateCcw}
            onClick={handleViewRetryProblems}
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
            <WeaknessCard weaknesses={weaknesses} onTagClick={handleViewProblemsByWeakness} />
            <TodaysRevision
              revision={todays_revision}
              lockedByServer={todays_revision_locked}
              onRevisionUpdate={handleRevisionUpdate}
              onAfterUnlock={() => fetchDashboardData(true)}
            />
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