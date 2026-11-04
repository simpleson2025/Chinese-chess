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
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-3 px-2">
      {/* Top Status Bar: Opponent Info */}
      <div className="flex items-center justify-between py-2 px-4 bg-stone-900/80 border border-stone-800 rounded-lg shadow-sm backdrop-blur-xs">
        {/* Opponent Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200">
            {gameMode === 'pve' ? <Bot size={18} /> : <Swords size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-200">
                {gameMode === 'pve' ? `AI 对手 (${DIFFICULTY_NAMES[aiDifficulty]})` : '黑方对弈'}
              </span>
              {turn === 'black' && gameStatus === 'playing' && (
                <span className="text-xs text-amber-400 font-medium animate-pulse">
                  {isAiThinking ? '思考中…' : '正在行棋'}
                </span>
              )}
            </div>
            {/* Captured Red pieces tray */}
            <div className="flex items-center gap-1 mt-0.5 min-h-[20px] flex-wrap">
              {capturedRed.length === 0 ? (
                <span className="text-xs text-stone-500">尚无吃子</span>
              ) : (
                capturedRed.map((p, idx) => (
                  <span
                    key={`cap-red-${idx}`}
                    className="inline-block text-xs font-serif-sc font-bold text-red-400 bg-red-950/40 px-1 rounded border border-red-900/40"
                  >
                    {PIECE_NAMES.red[p.type]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Game Status Badge */}
        <div className="text-center">
          {gameStatus === 'check' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-600 rounded-md text-rose-300 text-xs font-bold animate-bounce shadow-md">
              <ShieldAlert size={14} className="text-rose-400" />
              <span>将军！</span>
            </div>
          )}
          {gameStatus === 'checkmate' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/90 border border-amber-500 rounded-md text-amber-300 text-xs font-bold shadow-md">
              <Trophy size={14} className="text-amber-400" />
              <span>绝杀！{winner === 'red' ? '红方胜' : '黑方胜'}</span>
            </div>
          )}
          {gameStatus === 'stalemate' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 border border-stone-600 rounded-md text-stone-300 text-xs font-bold shadow-md">
              <AlertTriangle size={14} />
              <span>困毙！{winner === 'red' ? '红方胜' : '黑方胜'}</span>
            </div>
          )}
          {gameStatus === 'conceded' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 border border-stone-600 rounded-md text-stone-300 text-xs font-bold shadow-md">
              <span>认输！{winner === 'red' ? '红方胜' : '黑方胜'}</span>
            </div>
          )}
          {gameStatus === 'playing' && (
            <div className="text-xs text-stone-400 font-medium">
              第 <span className="text-stone-200 font-bold tabular-nums">{Math.floor(moveCount / 2) + 1}</span> 回合
            </div>
          )}
        </div>

        {/* Player Identity (Red) */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-2">
              {turn === 'red' && gameStatus === 'playing' && (
                <span className="text-xs text-red-400 font-medium animate-pulse">
                  轮到红方
                </span>
              )}
              <span className="text-sm font-semibold text-red-400">
                {gameMode === 'pve' ? '红方 (玩家)' : '红方对弈'}
              </span>
            </div>
            {/* Captured Black pieces tray */}
            <div className="flex items-center justify-end gap-1 mt-0.5 min-h-[20px] flex-wrap">
              {capturedBlack.length === 0 ? (
                <span className="text-xs text-stone-500">尚无吃子</span>
              ) : (
                capturedBlack.map((p, idx) => (
                  <span
                    key={`cap-black-${idx}`}
                    className="inline-block text-xs font-serif-sc font-bold text-stone-300 bg-stone-800/80 px-1 rounded border border-stone-700/60"
                  >
                    {PIECE_NAMES.black[p.type]}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 font-serif-sc font-bold text-sm">
            帥
          </div>
        </div>
      </div>
    </div>
  );
};
