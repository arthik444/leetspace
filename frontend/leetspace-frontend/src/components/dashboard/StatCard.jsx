import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ title, value, subtitle, icon: Icon, className = "" }) {
  return (
    <Card className={`bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 hover:shadow-md dark:hover:shadow-xl transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}