'use client';

import { create } from 'zustand';

import type { AnalysisResult } from '@/types';

export interface InsightState {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  setAnalysis: (analysis: AnalysisResult) => void;
  clearAnalysis: () => void;
  setIsAnalyzing: (v: boolean) => void;
}

export const useInsightStore = create<InsightState>((set) => ({
  analysis: null,
  isAnalyzing: false,

  setAnalysis: (analysis) => set({ analysis, isAnalyzing: false }),
  clearAnalysis: () => set({ analysis: null, isAnalyzing: false }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));
