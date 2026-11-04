import React from 'react';
import { GameMode, AIDifficulty } from '../types/xiangqi';
import { 
  RotateCcw, 
  Lightbulb, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Sparkles, 
  Flag,
  ArrowUpDown,
  User,
  Bot
} from 'lucide-react';

interface ControlPanelProps {
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  soundEnabled: boolean;
  canUndo: boolean;
  isAiThinking: boolean;
  isFlipped: boolean;
  onSetGameMode: (mode: GameMode) => void;
  onSetDifficulty: (diff: AIDifficulty) => void;
  onUndo: () => void;
  onHint: () => void;
  onFlipBoard: () => void;
  onRestart: () => void;
  onResign: () => void;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenAnalysis: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  gameMode,
  aiDifficulty,
  soundEnabled,
  canUndo,
  isAiThinking,
  isFlipped,
  onSetGameMode,
  onSetDifficulty,
  onUndo,
  onHint,
  onFlipBoard,
  onRestart,
  onResign,
  onToggleSound,
  onOpenRules,
  onOpenAnalysis,
}) => {
  return (
    <div className="w-full space-y-2.5">
      {/* Mode & Difficulty Card */}
      <div className="p-2.5 bg-stone-900/90 border border-stone-800 rounded-lg space-y-2">
        <div className="flex items-center justify-between gap-1">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-md border border-stone-800 flex-1">
            <button
              onClick={() => onSetGameMode('pve')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                gameMode === 'pve'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Bot size={13} />
              <span>人机对战</span>
            </button>
            <button
              onClick={() => onSetGameMode('pvp')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                gameMode === 'pvp'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <User size={13} />
              <span>双人对战</span>
            </button>
          </div>

          {/* Quick Toggles: Audio & Rules */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-md border border-stone-800 shrink-0">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? '静音' : '开启音效'}
              className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              onClick={onOpenRules}
              title="象棋走子规则"
              className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </div>

        {/* AI Difficulty Selector (Visible only in PvE) */}
        {gameMode === 'pve' && (
          <div className="flex items-center justify-between gap-1 bg-stone-950 p-1 rounded-md border border-stone-800/80">
            {(
              [
                ['easy', '初学入门'],
                ['medium', '业余进阶'],
                ['hard', '大师棋力'],
                ['master', '特级宗师'],
              ] as [AIDifficulty, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onSetDifficulty(key)}
                className={`flex-1 py-1 px-1 rounded text-[11px] text-center transition-colors ${
                  aiDifficulty === key
                    ? 'bg-stone-800 text-amber-400 font-semibold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Actions Grid (2 rows of 3 buttons) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo || isAiThinking}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 disabled:opacity-40 disabled:pointer-events-none rounded-md text-xs font-medium transition-all"
        >
          <RotateCcw size={14} className="text-amber-500" />
          <span>悔棋</span>
        </button>

        {/* Hint */}
        <button
          onClick={onHint}
          disabled={isAiThinking}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 disabled:opacity-40 disabled:pointer-events-none rounded-md text-xs font-medium transition-all"
        >
          <Lightbulb size={14} className="text-yellow-400" />
          <span>支招</span>
        </button>

        {/* Flip Board */}
        <button
          onClick={onFlipBoard}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 rounded-md text-xs font-medium transition-all"
        >
          <ArrowUpDown size={14} className="text-cyan-400" />
          <span>{isFlipped ? '翻回' : '翻盘'}</span>
        </button>

        {/* AI Grandmaster Commentary */}
        <button
          onClick={onOpenAnalysis}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-950/60 border border-amber-700/60 hover:bg-amber-900/60 text-amber-300 rounded-md text-xs font-semibold shadow-xs transition-all"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>AI解盘</span>
        </button>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 rounded-md text-xs font-medium transition-all"
        >
          <RefreshCw size={14} className="text-emerald-400" />
          <span>新局</span>
        </button>

        {/* Resign */}
        <button
          onClick={onResign}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-stone-900 border border-stone-800 hover:bg-rose-950/40 hover:border-rose-800/50 text-stone-400 hover:text-rose-300 rounded-md text-xs font-medium transition-all"
        >
          <Flag size={14} className="text-rose-400" />
          <span>认输</span>
        </button>
      </div>
    </div>
  );
};
