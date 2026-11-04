import React from 'react';
import { GameMode, GameStatus, PieceColor, AIDifficulty } from '../types/xiangqi';
import { Trophy, RefreshCw, Eye, Sparkles, X, ShieldAlert, Award } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: PieceColor | null;
  gameStatus: GameStatus;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  moveCount: number;
  capturedRedCount: number;
  capturedBlackCount: number;
  onRestart: () => void;
  onClose: () => void;
  onOpenAnalysis: () => void;
}

const DIFFICULTY_NAMES: Record<AIDifficulty, string> = {
  easy: '初学入门',
  medium: '业余进阶',
  hard: '大师棋力',
  master: '特级宗师',
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  gameStatus,
  gameMode,
  aiDifficulty,
  moveCount,
  capturedRedCount,
  capturedBlackCount,
  onRestart,
  onClose,
  onOpenAnalysis,
}) => {
  if (!isOpen) return null;

  const isRedWinner = winner === 'red';
  const isPvE = gameMode === 'pve';

  // Determine victory title & subtitle
  let outcomeTitle = '';
  let outcomeSubtitle = '';
  let reasonText = '';

  if (gameStatus === 'checkmate') {
    outcomeTitle = isRedWinner ? '红方绝杀大捷！' : '黑方绝杀大捷！';
    reasonText = `${isRedWinner ? '红方' : '黑方'}策马出车、重炮合围，成功将死敌将！对方主帅已无退路。`;
  } else if (gameStatus === 'stalemate') {
    outcomeTitle = isRedWinner ? '红方巧制困毙获胜！' : '黑方巧制困毙获胜！';
    reasonText = `按中国象棋正规竞赛规则，${isRedWinner ? '黑方' : '红方'}当前回合无任何合规合法着法可走（困毙），判定负。`;
  } else if (gameStatus === 'conceded') {
    outcomeTitle = isRedWinner ? '黑方推枰认输，红方胜！' : '红方推枰认输，黑方胜！';
    reasonText = '一方主动认负，局势分明，棋品见真章。';
  } else {
    outcomeTitle = '对局结束';
    reasonText = '本局对弈告一段落。';
  }

  if (isPvE) {
    if (isRedWinner) {
      outcomeSubtitle = `恭喜你在对阵【${DIFFICULTY_NAMES[aiDifficulty]}】AI 的对决中运筹帷幄，斩获胜利！`;
    } else {
      outcomeSubtitle = `惜败于【${DIFFICULTY_NAMES[aiDifficulty]}】AI，胜败乃弈家常事，复盘总结方能百炼成钢！`;
    }
  } else {
    outcomeSubtitle = `双人对局酣畅淋漓，恭喜${isRedWinner ? '红方' : '黑方'}取得本局优胜！`;
  }

  const rounds = Math.floor(moveCount / 2) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative bg-gradient-to-b from-[#1f1914] to-[#120e0b] border-2 border-amber-600/60 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center overflow-hidden"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(217, 119, 6, 0.25)',
        }}
      >
        {/* Background decorative watermark pattern */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border border-amber-500/10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full border border-amber-500/10 pointer-events-none" />

        {/* Close button (allows player to inspect board and history) */}
        <button
          onClick={onClose}
          title="关闭窗口并查看棋盘"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Winner Emblem / Seal */}
        <div className="mx-auto mb-4 flex items-center justify-center">
          <div
            className={`relative w-20 h-20 rounded-full flex items-center justify-center border-3 shadow-lg transition-transform ${
              isRedWinner
                ? 'border-red-500/80 bg-gradient-to-br from-red-900/90 to-red-950 text-red-100 shadow-red-900/40'
                : 'border-amber-500/80 bg-gradient-to-br from-stone-800 to-stone-950 text-stone-100 shadow-amber-900/40'
            }`}
          >
            <span className="font-serif-sc font-black text-3xl select-none leading-none drop-shadow-md">
              {isRedWinner ? '帥' : '將'}
            </span>
            <div className="absolute -bottom-2 px-2.5 py-0.5 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
              <Trophy size={11} />
              <span>胜局</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-serif-sc text-stone-100 tracking-wide mb-1.5">
          {outcomeTitle}
        </h2>
        <p className="text-xs text-amber-300/90 leading-relaxed max-w-sm mx-auto mb-4">
          {outcomeSubtitle}
        </p>

        {/* Reason card */}
        <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl text-xs text-stone-300 leading-relaxed mb-4 text-left">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            <Award size={14} />
            <span>终局判据</span>
          </div>
          <p>{reasonText}</p>
        </div>

        {/* Match statistics strip */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-900/70 border border-stone-800/70 rounded-xl mb-5 text-center">
          <div className="p-1">
            <div className="text-[11px] text-stone-400">总回合数</div>
            <div className="text-sm font-mono font-bold text-stone-200 mt-0.5 tabular-nums">
              {rounds} <span className="text-[10px] font-normal text-stone-400">({moveCount}着)</span>
            </div>
          </div>
          <div className="p-1 border-x border-stone-800">
            <div className="text-[11px] text-stone-400">红方斩获</div>
            <div className="text-sm font-mono font-bold text-red-400 mt-0.5 tabular-nums">
              {capturedBlackCount} <span className="text-[10px] font-normal text-stone-400">子</span>
            </div>
          </div>
          <div className="p-1">
            <div className="text-[11px] text-stone-400">黑方斩获</div>
            <div className="text-sm font-mono font-bold text-stone-300 mt-0.5 tabular-nums">
              {capturedRedCount} <span className="text-[10px] font-normal text-stone-400">子</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary: Play Again */}
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-lg text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <RefreshCw size={15} />
            <span>再弈一局</span>
          </button>

          {/* Secondary buttons grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-800/80 hover:bg-stone-800 border border-stone-700/70 text-stone-300 rounded-lg text-xs font-medium transition-colors"
            >
              <Eye size={13} className="text-cyan-400" />
              <span>复盘棋局</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAnalysis();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-800/80 hover:bg-amber-950/50 border border-amber-800/40 text-amber-300 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>AI棋圣评局</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
