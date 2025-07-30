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
      0: "bg-muted/30",
      1: "bg-green-200 dark:bg-green-900/40",
      2: "bg-green-300 dark:bg-green-800/60", 
      3: "bg-green-400 dark:bg-green-700/80",
      4: "bg-green-500 dark:bg-green-600"
    };
    return intensityClasses[level] || intensityClasses[0];
  };

  const months = groupByMonth(data);
  const recentMonths = months.slice(-12); // Show last 12 months

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Less</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(level)}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">More</span>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-2 min-w-fit">
              {recentMonths.map((month, monthIndex) => (
                <div key={`${month.year}-${month.month}`} className="space-y-1">
                  {/* Month label */}
                  <div className="text-xs text-muted-foreground text-center">
                    {month.month}
                  </div>
                  
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Fill empty days at start of month */}
                    {month.days.length > 0 && 
                      Array.from({ length: month.days[0].dayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-3 h-3" />
                      ))
                    }
                    
                    {/* Actual days */}
                    {month.days.map(day => (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${getIntensityClass(day.level)} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-primary transition-all`}
                        title={`${day.count} problems on ${day.date}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="text-sm text-muted-foreground">
            {data.filter(d => d.count > 0).length} days active in the last year
          </div>
        </div>
      </CardContent>
    </Card>
  );
}