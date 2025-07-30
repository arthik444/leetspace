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
      <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary" />
            <span className="text-muted-foreground dark:text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-destructive dark:text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground dark:text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">No Data</h2>
            <p className="text-muted-foreground dark:text-muted-foreground">No dashboard data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { basic_stats, weaknesses, todays_revision, activity_heatmap, recent_activity } = data;

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground dark:text-foreground">
            📊 Dashboard
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground">
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
            title="Most Used Tag"
            value={basic_stats.most_used_tags[0]?.tag || "None"}
            subtitle={basic_stats.most_used_tags[0] ? `${basic_stats.most_used_tags[0].count} problems` : ""}
            icon={Tags}
          />
          <StatCard
            title="Weaknesses"
            value={weaknesses.length}
            subtitle="Areas to improve"
            icon={TrendingUp}
          />
        </div>

        {/* Most Used Tags */}
        {basic_stats.most_used_tags.length > 0 && (
          <div className="space-y-3 p-4 rounded-lg border border-border dark:border-border bg-card dark:bg-card">
            <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Most Used Tags</h2>
            <div className="flex flex-wrap gap-2">
              {basic_stats.most_used_tags.map(({ tag, count }) => (
                <Badge key={tag} variant="secondary" className="text-sm bg-secondary dark:bg-secondary text-secondary-foreground dark:text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/80 transition-colors">
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