import React, { useRef, useEffect } from 'react';
import { Move } from '../types/xiangqi';
import { ScrollText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface MoveHistoryProps {
  history: Move[];
  currentMoveIndex: number; // for reviewing historical states, -1 if at live latest state
  onJumpToMove: (index: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onJumpToMove,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs: [roundNum, redMove, blackMove]
  const rounds: { round: number; red?: Move; black?: Move }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rounds.push({
      round: Math.floor(i / 2) + 1,
      red: history[i],
      black: history[i + 1],
    });
  }

  // Auto-scroll to bottom on new moves
  useEffect(() => {
    if (scrollRef.current && currentMoveIndex === -1) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, currentMoveIndex]);

  const activeIndex = currentMoveIndex === -1 ? history.length - 1 : currentMoveIndex;

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-lg p-3 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
          <ScrollText size={14} className="text-amber-500" />
          <span>对局棋谱</span>
          <span className="text-stone-500 font-normal ml-1">
            (共 {history.length} 着)
          </span>
        </div>

        {/* Step Replay Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onJumpToMove(0)}
            disabled={history.length === 0 || activeIndex === 0}
            title="回到开局"
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronsLeft size={13} />
          </button>
          <button
            onClick={() => onJumpToMove(Math.max(0, activeIndex - 1))}
            disabled={history.length === 0 || activeIndex <= 0}
            title="上一手"
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => onJumpToMove(Math.min(history.length - 1, activeIndex + 1))}
            disabled={history.length === 0 || activeIndex >= history.length - 1}
            title="下一手"
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => onJumpToMove(-1)}
            disabled={currentMoveIndex === -1}
            title="返回最新对局"
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-xs"
          >
            <ChevronsRight size={13} />
          </button>
        </div>
      </div>

      {/* Moves List Table */}
      <div
        ref={scrollRef}
        className="max-h-48 sm:max-h-60 overflow-y-auto pr-1 text-xs space-y-1 font-serif-sc"
      >
        {rounds.length === 0 ? (
          <div className="text-stone-500 text-center py-4 italic font-sans text-xs">
            棋局初起，等待红方先行
          </div>
        ) : (
          rounds.map(({ round, red, black }) => {
            const redIdx = (round - 1) * 2;
            const blackIdx = redIdx + 1;
            const isRedActive = activeIndex === redIdx;
            const isBlackActive = activeIndex === blackIdx;

            return (
              <div
                key={`round-${round}`}
                className="grid grid-cols-[32px_1fr_1fr] gap-2 items-center py-0.5 px-2 rounded hover:bg-stone-800/40"
              >
                <span className="text-stone-500 font-mono text-[11px] tabular-nums">
                  {round}.
                </span>

                {/* Red Move */}
                {red && (
                  <button
                    onClick={() => onJumpToMove(redIdx)}
                    className={`text-left px-1.5 py-0.5 rounded transition-colors ${
                      isRedActive
                        ? 'bg-red-950/80 text-red-300 font-bold border border-red-800/60'
                        : 'text-red-400/90 hover:text-red-300'
                    }`}
                  >
                    {red.notation}
                  </button>
                )}

                {/* Black Move */}
                {black && (
                  <button
                    onClick={() => onJumpToMove(blackIdx)}
                    className={`text-left px-1.5 py-0.5 rounded transition-colors ${
                      isBlackActive
                        ? 'bg-stone-800 text-amber-300 font-bold border border-stone-600'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {black.notation}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
