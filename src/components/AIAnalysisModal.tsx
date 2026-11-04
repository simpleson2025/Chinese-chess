import React from 'react';
import { X, Sparkles, Loader2, AlertCircle, Compass, Target, ShieldCheck } from 'lucide-react';
import { AnalysisResult } from '../types/xiangqi';

interface AIAnalysisModalProps {
  isOpen: boolean;
  isLoading: boolean;
  analysis: AnalysisResult | null;
  onClose: () => void;
  onReAnalyze: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  isLoading,
  analysis,
  onClose,
  onReAnalyze,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-stone-900 border border-amber-900/40 rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-base font-bold text-stone-100 font-serif-sc">
              AI 棋圣盘面深度解构
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-stone-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <p className="text-stone-300 text-sm font-serif-sc">
                特级大师正在推演全盘局势与算力深度…
              </p>
              <p className="text-stone-500 text-xs">
                综合评估子力价值、控场要津与潜在杀法
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Overall Evaluation Card */}
              <div className="p-3.5 bg-stone-950/80 rounded-lg border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-xs">当前局势判定</span>
                  <div className="text-base font-bold text-amber-400 font-serif-sc mt-0.5">
                    {analysis.evaluation}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 text-xs">局势权衡分</span>
                  <div className="text-sm font-mono font-bold text-stone-200 mt-0.5 tabular-nums">
                    {analysis.score > 0 ? `+${analysis.score.toFixed(1)} (红优)` : analysis.score < 0 ? `${analysis.score.toFixed(1)} (黑优)` : '0.0 (均势)'}
                  </div>
                </div>
              </div>

              {/* Tactical Advice */}
              <div className="p-3 bg-stone-950/50 rounded-lg border border-stone-800/80">
                <div className="flex items-center gap-1.5 font-bold text-stone-200 mb-1.5">
                  <Compass size={14} className="text-amber-500" />
                  <span>战术精要点评</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {analysis.tacticalAdvice}
                </p>
              </div>

              {/* Threats Checklist */}
              {analysis.threats && analysis.threats.length > 0 && (
                <div className="p-3 bg-stone-950/50 rounded-lg border border-stone-800/80">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1.5">
                    <AlertCircle size={14} className="text-rose-400" />
                    <span>重点防范隐患</span>
                  </div>
                  <ul className="space-y-1 text-stone-300">
                    {analysis.threats.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">·</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Plan */}
              {analysis.suggestedPlan && (
                <div className="p-3 bg-stone-950/50 rounded-lg border border-stone-800/80">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1.5">
                    <Target size={14} className="text-emerald-400" />
                    <span>战略行棋导向</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    {analysis.suggestedPlan}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400">
              未能获取到分析数据，请点击下方重新分析。
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between">
          <button
            onClick={onReAnalyze}
            disabled={isLoading}
            className="px-3 py-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded text-xs transition-colors disabled:opacity-40"
          >
            刷新分析
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-xs transition-colors"
          >
            返回棋局
          </button>
        </div>
      </div>
    </div>
  );
};
