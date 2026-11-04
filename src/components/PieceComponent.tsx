import React from 'react';
import { Piece } from '../types/xiangqi';
import { PIECE_NAMES } from '../utils/rules';

interface PieceComponentProps {
  piece: Piece;
  isSelected?: boolean;
  isLastMoveFrom?: boolean;
  isLastMoveTo?: boolean;
  isInCheck?: boolean;
  size?: number; // size in px
}

export const PieceComponent: React.FC<PieceComponentProps> = ({
  piece,
  isSelected = false,
  isLastMoveFrom = false,
  isLastMoveTo = false,
  isInCheck = false,
  size = 54,
}) => {
  const isRed = piece.color === 'red';
  const char = PIECE_NAMES[piece.color][piece.type];

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={`relative rounded-full flex items-center justify-center select-none cursor-pointer transition-all duration-200 ${
        isSelected ? 'xiangqi-piece selected scale-110 z-30' : 'xiangqi-piece z-20'
      } ${isInCheck ? 'ring-4 ring-rose-600 animate-pulse' : ''}`}
    >
      {/* Outer wooden rim */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-amber-950/40"
        style={{
          background: isRed
            ? 'radial-gradient(circle at 35% 30%, #fef5e7 0%, #ebd3a6 50%, #cb9d67 90%, #9e6f3b 100%)'
            : 'radial-gradient(circle at 35% 30%, #f9f2e4 0%, #e2cb9f 50%, #be8e59 90%, #875a2d 100%)',
        }}
      />

      {/* Engraved inner ring */}
      <div 
        className={`absolute inset-1 rounded-full border ${
          isRed ? 'border-amber-900/30' : 'border-stone-800/35'
        }`}
      />

      {/* Inner sunken circle */}
      <div 
        className="absolute inset-2 rounded-full border border-amber-950/20 flex items-center justify-center"
        style={{
          background: isRed
            ? 'radial-gradient(circle at 45% 45%, rgba(255,248,235,0.7) 0%, rgba(230,195,145,0.5) 100%)'
            : 'radial-gradient(circle at 45% 45%, rgba(250,240,225,0.7) 0%, rgba(220,185,135,0.5) 100%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
        }}
      >
        {/* Calligraphy piece character */}
        <span
          className={`font-serif-sc font-black tracking-tight select-none leading-none drop-shadow-sm ${
            isRed
              ? 'text-red-700 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
              : 'text-stone-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]'
          }`}
          style={{
            fontSize: `${Math.round(size * 0.54)}px`,
            textShadow: isRed
              ? '0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(120,0,0,0.3)'
              : '0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(30,30,30,0.4)',
          }}
        >
          {char}
        </span>
      </div>

      {/* Highlight ring for last move */}
      {isLastMoveTo && (
        <div className="absolute -inset-1 rounded-full border-2 border-amber-500/80 animate-ping opacity-30 pointer-events-none" />
      )}
    </div>
  );
};
