import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentActivity({ activities = [], className = "" }) {
  const navigate = useNavigate();

  if (activities.length === 0) {
    return (
      <Card className={`bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 h-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No recent activity
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Start solving problems to see your activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <Card className={`bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 h-full ${className}`}>
      <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Recent Activity
          </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
              onClick={() => handleProblemClick(activity.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">{activity.title}</h4>
                  {activity.retry_later && (
                    <RotateCcw className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" title="Marked for retry" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={`text-xs ${difficultyColors[activity.difficulty] || difficultyColors.Medium}`}
                  >
                    {activity.difficulty}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time_ago}</span>
                </div>

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {activity.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-zinc-700 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" />
            </div>
          ))}

          {/* View All Link */}
          <div className="pt-2 border-t border-gray-200 dark:border-zinc-700">
            <button 
              onClick={() => navigate('/problems')}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              View all problems →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}