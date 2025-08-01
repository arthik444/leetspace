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
      0: "bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700",
      1: "bg-green-300 dark:bg-green-900/40 border border-green-400 dark:border-green-800/50",
      2: "bg-green-400 dark:bg-green-800/60 border border-green-500 dark:border-green-700/70", 
      3: "bg-green-500 dark:bg-green-700/80 border border-green-600 dark:border-green-600/80",
      4: "bg-green-600 dark:bg-green-600/90 border border-green-700 dark:border-green-500/90"
    };
    return intensityClasses[level] || intensityClasses[0];
  };

  const months = groupByMonth(data);
  const recentMonths = months.slice(-12); // Show last 12 months

      return (
      <Card className={`bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Less</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(level)} shadow-sm`}
                />
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-400">More</span>
          </div>

          {/* Day labels */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-2">
            <div className="grid grid-cols-7 gap-0.5 w-fit">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="w-3 h-3 flex items-center justify-center text-center font-medium text-xs">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-fit">
              {recentMonths.map((month, monthIndex) => (
                <div key={`${month.year}-${month.month}`} className="space-y-2 flex-shrink-0">
                  {/* Month label */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium h-4">
                    {month.month}
                  </div>
                  
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-0.5 w-fit">
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
                        className={`w-3 h-3 rounded-sm ${getIntensityClass(day.level)} cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all shadow-sm flex-shrink-0`}
                        title={`${day.count} problems solved on ${day.date}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {data.filter(d => d.count > 0).length} days active in the last year
          </div>
        </div>
      </CardContent>
    </Card>
  );
}