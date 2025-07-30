import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function WeaknessCard({ weaknesses = [], className = "" }) {
  if (weaknesses.length === 0) {
    return (
      <Card className={`bg-card dark:bg-card border-border dark:border-border ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground dark:text-card-foreground">
            <AlertTriangle className="h-5 w-5 text-green-500 dark:text-green-400" />
            Weaknesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              No weakness areas detected! 🎉
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
              Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card dark:bg-card border-border dark:border-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-card-foreground dark:text-card-foreground">
          <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          Weaknesses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weaknesses.map((weakness, index) => (
            <div key={weakness.tag} className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-border bg-muted/30 dark:bg-muted/20 hover:bg-muted/40 dark:hover:bg-muted/30 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground dark:text-foreground">{weakness.tag}</span>
                  <Badge variant="destructive" className="text-xs bg-destructive dark:bg-destructive text-destructive-foreground dark:text-destructive-foreground">
                    {weakness.retry_rate}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                  {weakness.retry_count} of {weakness.total_problems} problems need review
                </p>
              </div>
              <div className="ml-4">
                <div className="w-16 bg-muted dark:bg-muted/60 rounded-full h-2 border border-border/50 dark:border-border/30">
                  <div 
                    className="bg-red-500 dark:bg-red-400 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(weakness.retry_rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {weaknesses.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50">
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