'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Lightbulb,
  Zap,
  History,
  Settings,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  WandSparkles, 
  Spline, 
  Target, 
  Eye
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isTyping?: boolean;
}

interface AiAssistantProps {
  onAnalyze?: () => void;
  onSuggest?: () => void;
  onFindCablePaths?: () => void;
  onOptimizeCoverage?: () => void;
  isAnalyzing?: boolean;
  isSuggesting?: boolean;
  isFindingPaths?: boolean;
  isOptimizingCoverage?: boolean;
  projectState?: any;
  onSuggestionApply?: (suggestion: string) => void;
  onProjectUpdate?: (updates: any) => void;
}

export function AiAssistant({ 
  onAnalyze, 
  onSuggest, 
  onFindCablePaths, 
  onOptimizeCoverage,
  isAnalyzing, 
  isSuggesting, 
  isFindingPaths,
  isOptimizingCoverage = false
}: AiAssistantProps) {
  const isAnyProcessing = isAnalyzing || isSuggesting || isFindingPaths || isOptimizingCoverage;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800/50 shadow-lg">
      <CardHeader className="p-3 border-b border-purple-200/50 dark:border-purple-800/80">
        <CardTitle className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <WandSparkles className="w-4 h-4" />
          ผู้ช่วย AI อัจฉริยะ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <Button
          onClick={onAnalyze}
          disabled={isAnyProcessing}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isAnalyzing ? 'กำลังวิเคราะห์...' : '✨ วิเคราะห์แผน'}
        </Button>
        
        <Button
          onClick={onSuggest}
          disabled={isAnyProcessing}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isSuggesting ? 'กำลังแนะนำ...' : '🎯 แนะนำการติดตั้ง'}
        </Button>
        
        {onOptimizeCoverage && (
          <Button
            onClick={onOptimizeCoverage}
            disabled={isAnyProcessing}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Target className="w-4 h-4 mr-2"/>
            {isOptimizingCoverage ? 'กำลังปรับแต่ง...' : 'ปรับแต่งการครอบคลุม'}
          </Button>
        )}
        
        <Button
          onClick={onFindCablePaths}
          disabled={isAnyProcessing}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Spline className="w-4 h-4 mr-2"/>
          {isFindingPaths ? 'กำลังเดินสาย...' : 'ค้นหาเส้นทางเดินสาย'}
        </Button>
      </CardContent>
    </Card>
  );
}
