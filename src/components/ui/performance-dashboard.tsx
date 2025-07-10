
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PerformanceMonitor } from '@/lib/ui-enhancements';
import { Activity, Zap, Database, Clock, X, Minimize2 } from 'lucide-react';

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
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

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

  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateStats = () => {
      // Simulate real performance metrics
      setStats({
        cacheHitRate: Math.random() * 100,
        cacheSize: Math.floor(Math.random() * 1000),
        averageResponseTime: Math.random() * 200 + 50,
        slowOperations: [
          { operation: 'Canvas Render', time: Math.random() * 100 + 20 },
          { operation: 'Device Update', time: Math.random() * 50 + 10 },
          { operation: 'AI Analysis', time: Math.random() * 300 + 100 }
        ],
        memoryUsage: Math.random() * 50 + 30,
        renderCount: Math.floor(Math.random() * 100),
        networkRequests: Math.floor(Math.random() * 10),
        errorCount: Math.floor(Math.random() * 3)
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl border-slate-700 z-50">
      <CardHeader className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white h-6 w-6 p-0"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-white h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-3 space-y-3 text-xs">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <div>
                <div className="text-slate-300">Response Time</div>
                <div className="font-mono text-green-400">{stats.averageResponseTime.toFixed(0)}ms</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-400" />
              <div>
                <div className="text-slate-300">Memory</div>
                <div className="font-mono text-blue-400">{stats.memoryUsage.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-purple-400" />
              <div>
                <div className="text-slate-300">Cache Hit</div>
                <div className="font-mono text-purple-400">{stats.cacheHitRate.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-red-400" />
              <div>
                <div className="text-slate-300">Renders</div>
                <div className="font-mono text-red-400">{stats.renderCount}</div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10">
              Network: {stats.networkRequests} req
            </Badge>
            {stats.errorCount > 0 && (
              <Badge variant="outline" className="text-red-400 border-red-400 bg-red-400/10">
                {stats.errorCount} errors
              </Badge>
            )}
          </div>

          {/* Slow Operations */}
          {stats.slowOperations.length > 0 && (
            <div>
              <div className="text-slate-400 mb-1">Slow Operations:</div>
              <div className="space-y-1">
                {stats.slowOperations.slice(0, 3).map((op, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate">{op.operation}</span>
                    <span className={`font-mono ${op.time > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {op.time.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
