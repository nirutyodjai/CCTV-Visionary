'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PerformanceMonitor } from '@/lib/ui-enhancements';
import { AIResponseCache } from '@/lib/ai-cache';
import { Activity, Zap, Database, Clock } from 'lucide-react';

interface PerformanceStats {
  cacheHitRate: number;
  cacheSize: number;
  averageResponseTime: number;
  slowOperations: Array<{ operation: string; time: number }>;
  memoryUsage: number;
  renderCount: number;
  networkRequests: number;
  errorCount: number;
}

export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats>({
    cacheHitRate: 0,
    cacheSize: 0,
    averageResponseTime: 0,
    slowOperations: [],
    memoryUsage: 0,
    renderCount: 0,
    networkRequests: 0,
    errorCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        updateStats();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const updateStats = () => {
    const cacheStats = AIResponseCache.getStats();
    const performanceMetrics = PerformanceMonitor.getMetrics ? PerformanceMonitor.getMetrics() : {};
    
    const slowOps = Object.entries(performanceMetrics)
      .filter(([_, data]) => data.avg > 1000)
      .map(([operation, data]) => ({ operation, time: data.avg }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);

    const avgResponseTime = Object.values(performanceMetrics)
      .reduce((sum, data) => sum + data.avg, 0) / Object.keys(performanceMetrics).length || 0;

    setStats({
      cacheHitRate: cacheStats.hitRate,
      cacheSize: cacheStats.size,
      averageResponseTime: avgResponseTime,
      slowOperations: slowOps,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      renderCount: stats.renderCount + 1,
      networkRequests: stats.networkRequests,
      errorCount: stats.errorCount
    });
  };

  const handleClearCache = () => {
    AIResponseCache.clear();
    updateStats();
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white hover:bg-gray-800"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Performance Monitor</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Cache Statistics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-3 w-3 text-blue-400" />
              <span>Cache Hit Rate</span>
            </div>
            <Badge 
              variant={stats.cacheHitRate > 70 ? "default" : "destructive"}
              className="text-xs"
            >
              {stats.cacheHitRate.toFixed(1)}%
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-3 w-3 text-green-400" />
              <span>Cache Size</span>
            </div>
            <span className="text-gray-300">{stats.cacheSize} entries</span>
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-yellow-400" />
              <span>Avg Response</span>
            </div>
            <Badge 
              variant={stats.averageResponseTime < 1000 ? "default" : "destructive"}
              className="text-xs"
            >
              {stats.averageResponseTime.toFixed(0)}ms
            </Badge>
          </div>

          {/* Slow Operations */}
          {stats.slowOperations.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-orange-400">
                <Zap className="h-3 w-3" />
                <span>Slow Operations</span>
              </div>
              {stats.slowOperations.map((op, index) => (
                <div key={index} className="flex justify-between text-xs pl-5">
                  <span className="text-gray-300 truncate">{op.operation}</span>
                  <span className="text-orange-400">{op.time.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="flex-1 h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={updateStats}
              className="flex-1 h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
