import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, ExternalLink, Target, CheckCircle, XCircle, UserCheck, SkipForward } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { problemsAPI } from "@/lib/api";
import { toast } from "sonner";

export function TodaysRevision({ revision, className = "", onRevisionUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(null);

  if (!revision) {
    return (
      <Card className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Today's Revision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              No problems to review today!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All caught up with your retry queue
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

  const handleViewProblem = () => {
    navigate(`/problems/${revision.id}`);
  };

  const handleSkipToday = () => {
    setActionCompleted({
      type: "skip",
      message: "Skipped for today",
      description: "Problem stays in queue, no changes made"
    });

    setTimeout(() => {
      setActionCompleted(null);
    }, 3000);
  };

  const handleCompleteReviewFuture = async () => {
    setLoading(true);
    try {
      // Update review_count by incrementing it
      const currentReviewCount = revision.review_count || 0;
      const updateData = {
        review_count: currentReviewCount + 1
      };

      await problemsAPI.updateProblem(revision.id, updateData);
      
      // Update local state
      const updatedProblem = {
        ...revision,
        review_count: currentReviewCount + 1
      };
      
      if (onRevisionUpdate) {
        onRevisionUpdate(updatedProblem);
      }

      setActionCompleted({
        type: "future",
        message: "Review completed - Coming back in future",
        description: `Review count updated to ${currentReviewCount + 1}. Problem stays in queue.`
      });

      toast.success("Review completed! Problem will be reviewed again in the future.");

      setTimeout(() => {
        setActionCompleted(null);
      }, 3000);

    } catch (error) {
      console.error("Failed to update review count:", error);
      toast.error("Failed to update review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReviewRemove = async () => {
    setLoading(true);
    try {
      // Set retry_later = No to remove from queue
      const updateData = {
        retry_later: "No"
      };

      await problemsAPI.updateProblem(revision.id, updateData);
      
      // Update local state
      const updatedProblem = {
        ...revision,
        retry_later: "No"
      };
      
      if (onRevisionUpdate) {
        onRevisionUpdate(updatedProblem);
      }

      setActionCompleted({
        type: "remove",
        message: "Review completed - Removed from retry queue",
        description: "Problem has been permanently removed from retry queue."
      });

      toast.success("Review completed! Problem removed from retry queue.");

      setTimeout(() => {
        setActionCompleted(null);
      }, 3000);

    } catch (error) {
      console.error("Failed to update retry_later:", error);
      toast.error("Failed to remove from retry queue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (actionCompleted) {
    const icons = {
      skip: SkipForward,
      future: CheckCircle,
      remove: UserCheck
    };
    
    const colors = {
      skip: "text-blue-600 dark:text-blue-400",
      future: "text-green-600 dark:text-green-400", 
      remove: "text-purple-600 dark:text-purple-400"
    };

    const IconComponent = icons[actionCompleted.type];

    return (
      <Card className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <IconComponent className={`h-5 w-5 ${colors[actionCompleted.type]}`} />
            {actionCompleted.message}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {actionCompleted.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Today's Revision
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Problem Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm leading-relaxed text-gray-900 dark:text-white">
                {revision.title}
              </h3>
              <Badge 
                className={`text-xs ml-2 ${difficultyColors[revision.difficulty] || difficultyColors.Medium}`}
              >
                {revision.difficulty}
              </Badge>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {revision.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 rounded text-gray-600 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {revision.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 rounded text-gray-600 dark:text-gray-300">
                  +{revision.tags.length - 3}
                </span>
              )}
            </div>
            
            {/* Days since solved and review count */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Solved {revision.days_since_solved} day{revision.days_since_solved !== 1 ? 's' : ''} ago
                </span>
              </div>
              {revision.review_count > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    Reviewed {revision.review_count} time{revision.review_count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Complete Review Actions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Complete Review:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={handleCompleteReviewFuture}
                disabled={loading}
                className="flex-1 text-sm h-8 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Choose to come back in future
              </Button>
              <Button 
                onClick={handleCompleteReviewRemove}
                disabled={loading}
                className="flex-1 text-sm h-8 bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Have confidence, remove from retry
              </Button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleSkipToday}
                variant="outline"
                className="text-sm h-8 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300"
                size="sm"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Skip Today
              </Button>
              <Button 
                onClick={handleViewProblem}
                variant="outline"
                className="text-sm h-8 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300"
                size="sm"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Problem
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Queue Updates:</strong> Choose "come back in future" to increment review count and keep in queue. 
              Choose "remove from retry" to permanently remove from queue.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}