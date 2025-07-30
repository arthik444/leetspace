import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentActivity({ activities = [], className = "" }) {
  const navigate = useNavigate();

  if (activities.length === 0) {
    return (
      <Card className={`bg-card dark:bg-card border-border dark:border-border ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground dark:text-card-foreground">
            <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
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
    <Card className={`bg-card dark:bg-card border-border dark:border-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-card-foreground dark:text-card-foreground">
          <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-border bg-muted/30 dark:bg-muted/20 hover:bg-muted/50 dark:hover:bg-muted/40 cursor-pointer transition-colors"
              onClick={() => handleProblemClick(activity.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate text-foreground dark:text-foreground">{activity.title}</h4>
                  {activity.retry_later && (
                    <RotateCcw className="h-3 w-3 text-orange-500 dark:text-orange-400 flex-shrink-0" title="Marked for retry" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={`text-xs ${difficultyColors[activity.difficulty] || difficultyColors.Medium}`}
                  >
                    {activity.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground dark:text-muted-foreground">{activity.time_ago}</span>
                </div>

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {activity.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-1.5 py-0.5 text-xs bg-muted dark:bg-muted/60 rounded text-muted-foreground dark:text-muted-foreground border border-border/50 dark:border-border/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ExternalLink className="h-4 w-4 text-muted-foreground dark:text-muted-foreground ml-2 flex-shrink-0" />
            </div>
          ))}

          {/* View All Link */}
          <div className="pt-2 border-t border-border dark:border-border">
            <button 
              onClick={() => navigate('/problems')}
              className="w-full text-sm text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors"
            >
              View all problems →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}