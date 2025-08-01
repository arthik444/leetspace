import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TodaysRevision({ revision, className = "" }) {
  const navigate = useNavigate();

  if (!revision) {
    return (
      <Card className={`bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Today's Revision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No problems to review today! 🎉
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All caught up with your spaced repetition
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

  const handleReview = () => {
    navigate(`/problems/${revision.id}`);
  };

  const handleSkip = () => {
    // Could implement a "skip for today" functionality
    console.log("Skipping revision for today");
  };

  return (
    <Card className={`bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 ${className}`}>
      <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Today's Revision
          </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Problem Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm leading-relaxed text-gray-900 dark:text-white">{revision.title}</h3>
              <Badge 
                className={`text-xs ml-2 ${difficultyColors[revision.difficulty] || difficultyColors.Medium}`}
              >
                {revision.difficulty}
              </Badge>
            </div>
            
            {/* Tags */}
            {revision.tags && revision.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {revision.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 rounded-md text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {revision.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 rounded-md text-gray-600 dark:text-gray-300">
                    +{revision.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Time since solved */}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>
                Solved {revision.days_since_solved} day{revision.days_since_solved !== 1 ? 's' : ''} ago
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleReview}
              className="flex-1 text-sm h-8 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              size="sm"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Review Now
            </Button>
            <Button 
              onClick={handleSkip}
              variant="outline" 
              className="text-sm h-8 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
              size="sm"
            >
              Skip Today
            </Button>
          </div>

          {/* Spaced Repetition Info */}
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              📚 Spaced repetition helps you retain knowledge longer
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}