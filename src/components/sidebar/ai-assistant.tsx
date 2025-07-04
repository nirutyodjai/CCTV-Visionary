'use client';
import { WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AiAssistantProps {
  onAnalyze: () => void;
  onSuggest: () => void;
  isAnalyzing: boolean;
  isSuggesting: boolean;
}

export function AiAssistant({ onAnalyze, onSuggest, isAnalyzing, isSuggesting }: AiAssistantProps) {
  return (
    <Card className="bg-purple-50/50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <WandSparkles className="w-5 h-5" />
          ผู้ช่วย AI
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing || isSuggesting}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          {isAnalyzing ? 'กำลังวิเคราะห์...' : '✨ วิเคราะห์แผน'}
        </Button>
        <Button
          onClick={onSuggest}
          disabled={isAnalyzing || isSuggesting}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          {isSuggesting ? 'กำลังแนะนำ...' : '✨ แนะนำการติดตั้ง'}
        </Button>
      </CardContent>
    </Card>
  );
}
