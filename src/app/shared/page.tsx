'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WeeklyPlan, Workout } from '@/lib/schemas';
import { 
  decodeSharePayload, 
  weeklyPlanToMarkdown, 
  workoutToMarkdown, 
  downloadMarkdown,
  weeklyPlanToText,
  workoutToText,
  weeklyPlanToHtml,
  workoutToHtml,
  downloadFile,
  copyToClipboard
} from '@/lib/export';
import WorkoutDisplay from '@/components/WorkoutDisplay';
import WeeklyPlanDisplay from '@/components/WeeklyPlanDisplay';

function SharedContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const planEncoded = searchParams.get('plan');

  const plan = useMemo(() => {
    if (!planEncoded) return null;
    return decodeSharePayload<WeeklyPlan | Workout>(planEncoded);
  }, [planEncoded]);

  const handleExportMd = () => {
    if (type === 'weekly' && plan) {
      downloadMarkdown(weeklyPlanToMarkdown(plan as WeeklyPlan), 'regimen-plan.md');
    } else if (type === 'single' && plan) {
      downloadMarkdown(workoutToMarkdown(plan as Workout), 'regimen-workout.md');
    }
  };

  const handleExportTxt = () => {
    if (type === 'weekly' && plan) {
      downloadFile(weeklyPlanToText(plan as WeeklyPlan), 'regimen-plan.txt', 'text/plain');
    } else if (type === 'single' && plan) {
      downloadFile(workoutToText(plan as Workout), 'regimen-workout.txt', 'text/plain');
    }
  };

  const handleExportHtml = () => {
    if (type === 'weekly' && plan) {
      downloadFile(weeklyPlanToHtml(plan as WeeklyPlan), 'regimen-plan.html', 'text/html');
    } else if (type === 'single' && plan) {
      downloadFile(workoutToHtml(plan as Workout), 'regimen-workout.html', 'text/html');
    }
  };

  const handleShare = async () => {
    if (!plan) return;
    const url = window.location.href;
    await copyToClipboard(url);
  };

  if (!planEncoded || !plan) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black">Invalid or expired link</h2>
        <p className="mt-2 text-muted-foreground">
          This workout plan link is invalid or could not be decoded.
        </p>
        <Link href="/" className="mt-6 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90">
          Back to Regimen
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-16 z-40 border-b border-border/20 bg-muted/10 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Shared Workout Plan</span>
          <div className="flex gap-3">
            <button onClick={handleExportMd} className="rounded-lg border border-border/30 bg-background/50 px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground/80 transition-all hover:bg-primary hover:text-primary-foreground">
              Export MD
            </button>
            <Link href="/" className="rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90">
              Create Your Own
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-5xl px-6">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card/40 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/[0.05]">
          {type === 'weekly' ? (
            <WeeklyPlanDisplay
              plan={plan as WeeklyPlan}
              onRegenerate={() => {}}
              onExportMd={handleExportMd}
              onExportTxt={handleExportTxt}
              onExportHtml={handleExportHtml}
              onExportPdf={() => {}}
              onShare={handleShare}
            />
          ) : (
            <WorkoutDisplay
              workout={plan as Workout}
              onRegenerate={() => {}}
              onAdjust={() => {}}
              onExportMd={handleExportMd}
              onExportTxt={handleExportTxt}
              onExportHtml={handleExportHtml}
              onExportPdf={() => {}}
              onShare={handleShare}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SharedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      }>
        <SharedContent />
      </Suspense>
    </div>
  );
}
