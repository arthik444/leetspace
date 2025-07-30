import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function WeaknessCard({ weaknesses = [], className = "" }) {
  if (weaknesses.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Weaknesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No weakness areas detected! 🎉
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Weaknesses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weaknesses.map((weakness, index) => (
            <div key={weakness.tag} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{weakness.tag}</span>
                  <Badge variant="destructive" className="text-xs">
                    {weakness.retry_rate}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {weakness.retry_count} of {weakness.total_problems} problems need review
                </p>
              </div>
              <div className="ml-4">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(weakness.retry_rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {weaknesses.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                💡 Consider reviewing and practicing more problems in these areas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}