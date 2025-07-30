import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityHeatmap({ data = [], className = "" }) {
  // Group data by months for layout
  const groupByMonth = (heatmapData) => {
    const months = {};
    heatmapData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          days: []
        };
      }
      months[monthKey].days.push({
        ...day,
        dayOfWeek: date.getDay(),
        date: date.getDate()
      });
    });
    return Object.values(months);
  };

  const getIntensityClass = (level) => {
    const intensityClasses = {
      0: "bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60",
      1: "bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800/60",
      2: "bg-green-200 dark:bg-green-800/50 border border-green-300 dark:border-green-700/70", 
      3: "bg-green-300 dark:bg-green-700/60 border border-green-400 dark:border-green-600/80",
      4: "bg-green-400 dark:bg-green-600/70 border border-green-500 dark:border-green-500/90"
    };
    return intensityClasses[level] || intensityClasses[0];
  };

  const months = groupByMonth(data);
  const recentMonths = months.slice(-12); // Show last 12 months

      return (
      <Card className={`bg-card dark:bg-card border-border dark:border-border ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground dark:text-card-foreground">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground dark:text-muted-foreground">Less</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-4 h-4 rounded-sm ${getIntensityClass(level)} shadow-sm`}
                />
              ))}
            </div>
            <span className="text-muted-foreground dark:text-muted-foreground">More</span>
          </div>

          {/* Day labels */}
          <div className="text-xs text-muted-foreground dark:text-muted-foreground mb-3">
            <div className="grid grid-cols-7 gap-1 w-fit">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="w-4 h-4 flex items-center justify-center text-center font-medium">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-3 min-w-fit">
              {recentMonths.map((month, monthIndex) => (
                <div key={`${month.year}-${month.month}`} className="space-y-2">
                  {/* Month label */}
                  <div className="text-xs text-muted-foreground dark:text-muted-foreground text-center font-medium">
                    {month.month}
                  </div>
                  
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Fill empty days at start of month */}
                    {month.days.length > 0 && 
                      Array.from({ length: month.days[0].dayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-4 h-4" />
                      ))
                    }
                    
                    {/* Actual days */}
                    {month.days.map(day => (
                      <div
                        key={day.date}
                        className={`w-4 h-4 rounded-sm ${getIntensityClass(day.level)} cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary transition-all shadow-sm`}
                        title={`${day.count} problems solved on ${day.date}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            {data.filter(d => d.count > 0).length} days active in the last year
          </div>
        </div>
      </CardContent>
    </Card>
  );
}