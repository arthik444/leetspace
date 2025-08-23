import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";

export function WeaknessCard({ weaknesses = [], className = "", onTagClick }) {
  if (weaknesses.length === 0) {
    return (
      <Card className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Weaknesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              No weakness areas detected!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keep up the great work!
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
          <TrendingDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Weaknesses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weaknesses.map((weakness, index) => (
            <div key={weakness.tag} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                    onClick={() => onTagClick && onTagClick(weakness.tag)}
                    title={`Click to view problems with tag: ${weakness.tag}`}
                  >
                    {weakness.tag}
                  </span>
                  <Badge variant="destructive" className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                    {weakness.retry_rate}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {weakness.retry_count} of {weakness.total_problems} problems need review
                </p>
              </div>
              <div className="ml-4">
                <div className="w-16 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 border border-gray-300 dark:border-zinc-600">
                  <div 
                    className="bg-red-400 dark:bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(weakness.retry_rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {weaknesses.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Consider reviewing and practicing more problems in these areas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}