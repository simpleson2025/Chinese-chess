import React from 'react';
import { GameMode, GameStatus, Piece, PieceColor, AIDifficulty } from '../types/xiangqi';
import { PIECE_NAMES } from '../utils/rules';
import { Trophy, Swords, Bot, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GameHUDProps {
  turn: PieceColor;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  gameStatus: GameStatus;
  winner: PieceColor | null;
  isAiThinking: boolean;
  capturedRed: Piece[];
  capturedBlack: Piece[];
  moveCount: number;
  onOpenGameOverModal?: () => void;
}

const DIFFICULTY_NAMES: Record<AIDifficulty, string> = {
  easy: '初学入门',
  medium: '业余进阶',
  hard: '大师棋力',
  master: '特级宗师',
};

export const GameHUD: React.FC<GameHUDProps> = ({
  turn,
  gameMode,
  aiDifficulty,
  gameStatus,
  winner,
  isAiThinking,
  capturedRed,
  capturedBlack,
  moveCount,
  onOpenGameOverModal,
}) => {
  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-lg p-3 shadow-sm backdrop-blur-xs space-y-2.5">
      {/* 1. Opponent Info (Black / AI) */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
            {gameMode === 'pve' ? <Bot size={15} /> : <Swords size={15} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-200">
                {gameMode === 'pve' ? `AI (${DIFFICULTY_NAMES[aiDifficulty]})` : '黑方'}
              </span>
              {turn === 'black' && gameStatus === 'playing' && (
                <span className="text-[11px] text-amber-400 font-medium animate-pulse">
                  {isAiThinking ? '思考中…' : '正在行棋'}
                </span>
              )}
            </div>
            {/* Captured Red pieces tray */}
            <div className="flex items-center gap-1 mt-0.5 min-h-[18px] flex-wrap">
              {capturedRed.length === 0 ? (
                <span className="text-[11px] text-stone-500">尚无吃子</span>
              ) : (
                capturedRed.map((p, idx) => (
                  <span
                    key={`cap-red-${idx}`}
                    className="inline-block text-[11px] font-serif-sc font-bold text-red-400 bg-red-950/40 px-1 rounded border border-red-900/40"
                  >
                    {PIECE_NAMES.red[p.type]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-stone-800/80 border border-stone-700 flex items-center justify-center text-stone-300 font-serif-sc font-bold text-xs">
          將
        </div>
      </div>

      {/* 2. Middle Status & Turn Bar */}
      <div className="flex items-center justify-between py-1 px-2.5 bg-stone-950/70 rounded-md border border-stone-800/80">
        <div className="text-[11px] text-stone-400">
          第 <span className="text-stone-200 font-mono font-bold tabular-nums">{Math.floor(moveCount / 2) + 1}</span> 回合
        </div>

        {/* Status Alert Badge */}
        <div>
          {gameStatus === 'check' && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-rose-950/90 border border-rose-600 rounded text-rose-300 text-xs font-bold animate-bounce">
              <ShieldAlert size={12} className="text-rose-400" />
              <span>将军！</span>
            </div>
          )}
          {gameStatus === 'checkmate' && (
            <button
              onClick={onOpenGameOverModal}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-950/90 border border-amber-500 rounded text-amber-300 text-xs font-bold hover:bg-amber-900 transition-colors shadow-sm cursor-pointer"
            >
              <Trophy size={12} className="text-amber-400" />
              <span>绝杀！{winner === 'red' ? '红方胜' : '黑方胜'} (查看结算)</span>
            </button>
          )}
          {gameStatus === 'stalemate' && (
            <button
              onClick={onOpenGameOverModal}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-stone-800 border border-stone-600 rounded text-stone-300 text-xs font-bold hover:bg-stone-700 transition-colors shadow-sm cursor-pointer"
            >
              <AlertTriangle size={12} />
              <span>困毙！{winner === 'red' ? '红方胜' : '黑方胜'} (查看结算)</span>
            </button>
          )}
          {gameStatus === 'conceded' && (
            <button
              onClick={onOpenGameOverModal}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-stone-800 border border-stone-600 rounded text-stone-300 text-xs font-bold hover:bg-stone-700 transition-colors shadow-sm cursor-pointer"
            >
              <span>认输！{winner === 'red' ? '红方胜' : '黑方胜'} (查看结算)</span>
            </button>
          )}
          {gameStatus === 'playing' && (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${turn === 'red' ? 'bg-red-500 ring-2 ring-red-500/40' : 'bg-stone-400 ring-2 ring-stone-400/40'}`} />
              <span className={turn === 'red' ? 'text-red-400 font-bold' : 'text-stone-200 font-bold'}>
                {turn === 'red' ? '红方先手走子' : '黑方走子'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Player Info (Red) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-red-950/70 border border-red-800/70 flex items-center justify-center text-red-400 font-serif-sc font-bold text-xs">
            帥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-400">
                {gameMode === 'pve' ? '红方 (你)' : '红方'}
              </span>
              {turn === 'red' && gameStatus === 'playing' && (
                <span className="text-[11px] text-red-400 font-medium animate-pulse">
                  轮到走子
                </span>
              )}
            </div>
            {/* Captured Black pieces tray */}
            <div className="flex items-center gap-1 mt-0.5 min-h-[18px] flex-wrap">
              {capturedBlack.length === 0 ? (
                <span className="text-[11px] text-stone-500">尚无吃子</span>
              ) : (
                capturedBlack.map((p, idx) => (
                  <span
                    key={`cap-black-${idx}`}
                    className="inline-block text-[11px] font-serif-sc font-bold text-stone-300 bg-stone-800/80 px-1 rounded border border-stone-700/60"
                  >
                    {PIECE_NAMES.black[p.type]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
