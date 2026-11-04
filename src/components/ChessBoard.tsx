import React, { useRef, useEffect, useState } from 'react';
import { Board, Coordinate, Move, Piece, PieceColor } from '../types/xiangqi';
import { PieceComponent } from './PieceComponent';
import { isInsidePalace } from '../utils/rules';

interface ChessBoardProps {
  board: Board;
  selectedCoord: Coordinate | null;
  legalMoves: Coordinate[];
  lastMove: Move | null;
  hintMove: { from: Coordinate; to: Coordinate } | null;
  inCheckColor: PieceColor | null;
  flipped: boolean;
  onSquareClick: (r: number, c: number) => void;
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedCoord,
  legalMoves,
  lastMove,
  hintMove,
  inCheckColor,
  flipped,
  onSquareClick,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(480);

  // Responsive board sizing - maximizes board area, especially in side-by-side desktop layout
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const isDesktop = window.innerWidth >= 1024;
        const parentW = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        // On desktop, the board sits in its own left column with only the top header above
        const parentH = isDesktop ? window.innerHeight - 100 : window.innerHeight - 340;
        
        // Upper bound on desktop allows board to expand up to 750px width
        const maxAvailableW = isDesktop 
          ? Math.min(parentW - 16, 750) 
          : Math.min(parentW - 16, 520);
        const maxAvailableH = Math.max(300, parentH);
        
        // Xiangqi grid aspect ratio is 8 columns span / 9 rows span (~0.888)
        const calculatedW = Math.min(maxAvailableW, maxAvailableH * (8 / 9.3));
        setBoardWidth(Math.max(290, Math.floor(calculatedW)));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Board dimensions
  // Standard grid: 8 horizontal intervals, 9 vertical intervals
  const paddingX = boardWidth * 0.055;
  const paddingY = boardWidth * 0.055;
  const gridW = boardWidth - paddingX * 2;
  const cellW = gridW / 8;
  const cellH = cellW; // square cells
  const gridH = cellH * 9;
  const boardHeight = gridH + paddingY * 2;
  // Scalable piece size up to 74px on large boards
  const pieceSize = Math.max(28, Math.min(74, Math.floor(cellW * 0.92)));

  // Coordinate mapping depending on flipped state
  const getDisplayCoords = (r: number, c: number) => {
    const displayR = flipped ? 9 - r : r;
    const displayC = flipped ? 8 - c : c;
    return { displayR, displayC };
  };

  const getPixelPos = (r: number, c: number) => {
    const { displayR, displayC } = getDisplayCoords(r, c);
    const x = paddingX + displayC * cellW;
    const y = paddingY + displayR * cellH;
    return { x, y };
  };

  // Star/cross markers (十字折角) data
  const starPoints = [
    // Cannons
    { r: 2, c: 1 }, { r: 2, c: 7 },
    { r: 7, c: 1 }, { r: 7, c: 7 },
    // Soldiers
    { r: 3, c: 0, edge: 'left' }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 6 }, { r: 3, c: 8, edge: 'right' },
    { r: 6, c: 0, edge: 'left' }, { r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }, { r: 6, c: 8, edge: 'right' },
  ];

  const renderStarCorners = (r: number, c: number, edge?: string) => {
    const { x, y } = getPixelPos(r, c);
    const d = 4; // distance from intersection
    const s = 6; // length of corner arm
    const color = '#5c3a21';
    const strokeWidth = 1.2;

    const corners: React.JSX.Element[] = [];

    // Top-left
    if (edge !== 'left') {
      corners.push(
        <path
          key="tl"
          d={`M ${x - d - s} ${y - d} L ${x - d} ${y - d} L ${x - d} ${y - d - s}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      );
    }
    // Top-right
    if (edge !== 'right') {
      corners.push(
        <path
          key="tr"
          d={`M ${x + d + s} ${y - d} L ${x + d} ${y - d} L ${x + d} ${y - d - s}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      );
    }
    // Bottom-left
    if (edge !== 'left') {
      corners.push(
        <path
          key="bl"
          d={`M ${x - d - s} ${y + d} L ${x - d} ${y + d} L ${x - d} ${y + d + s}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      );
    }
    // Bottom-right
    if (edge !== 'right') {
      corners.push(
        <path
          key="br"
          d={`M ${x + d + s} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + d + s}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      );
    }

    return <g key={`star-${r}-${c}`}>{corners}</g>;
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto select-none touch-manipulation flex items-center justify-center p-2"
    >
      <div
        className="relative wood-board-pattern rounded-lg overflow-hidden border border-amber-950/40"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
      >
        {/* SVG Board Lines & Embellishments */}
        <svg
          width={boardWidth}
          height={boardHeight}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Subtle outer decorative double border */}
          <rect
            x={paddingX - 10}
            y={paddingY - 10}
            width={gridW + 20}
            height={gridH + 20}
            fill="none"
            stroke="#5c3a21"
            strokeWidth="2.5"
            strokeOpacity="0.8"
            rx="2"
          />
          <rect
            x={paddingX - 5}
            y={paddingY - 5}
            width={gridW + 10}
            height={gridH + 10}
            fill="none"
            stroke="#784c28"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* 10 Horizontal Lines */}
          {Array.from({ length: 10 }).map((_, r) => {
            const y = paddingY + r * cellH;
            return (
              <line
                key={`h-${r}`}
                x1={paddingX}
                y1={y}
                x2={paddingX + gridW}
                y2={y}
                stroke="#5c3a21"
                strokeWidth={r === 0 || r === 9 ? '2' : '1.2'}
              />
            );
          })}

          {/* 9 Vertical Lines */}
          {Array.from({ length: 9 }).map((_, c) => {
            const x = paddingX + c * cellW;
            const topY = paddingY;
            const riverTopY = paddingY + 4 * cellH;
            const riverBottomY = paddingY + 5 * cellH;
            const bottomY = paddingY + 9 * cellH;

            if (c === 0 || c === 8) {
              // Outer edges span all 9 ranks
              return (
                <line
                  key={`v-${c}`}
                  x1={x}
                  y1={topY}
                  x2={x}
                  y2={bottomY}
                  stroke="#5c3a21"
                  strokeWidth="2"
                />
              );
            } else {
              // Inner vertical lines break at the river
              return (
                <g key={`v-${c}`}>
                  <line
                    x1={x}
                    y1={topY}
                    x2={x}
                    y2={riverTopY}
                    stroke="#5c3a21"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={x}
                    y1={riverBottomY}
                    x2={x}
                    y2={bottomY}
                    stroke="#5c3a21"
                    strokeWidth="1.2"
                  />
                </g>
              );
            }
          })}

          {/* Palace Diagonals (Top Palace rows 0-2, cols 3-5) */}
          <line
            x1={paddingX + 3 * cellW}
            y1={paddingY}
            x2={paddingX + 5 * cellW}
            y2={paddingY + 2 * cellH}
            stroke="#5c3a21"
            strokeWidth="1.2"
          />
          <line
            x1={paddingX + 5 * cellW}
            y1={paddingY}
            x2={paddingX + 3 * cellW}
            y2={paddingY + 2 * cellH}
            stroke="#5c3a21"
            strokeWidth="1.2"
          />

          {/* Palace Diagonals (Bottom Palace rows 7-9, cols 3-5) */}
          <line
            x1={paddingX + 3 * cellW}
            y1={paddingY + 7 * cellH}
            x2={paddingX + 5 * cellW}
            y2={paddingY + 9 * cellH}
            stroke="#5c3a21"
            strokeWidth="1.2"
          />
          <line
            x1={paddingX + 5 * cellW}
            y1={paddingY + 7 * cellH}
            x2={paddingX + 3 * cellW}
            y2={paddingY + 9 * cellH}
            stroke="#5c3a21"
            strokeWidth="1.2"
          />

          {/* Traditional Star/Cross Points */}
          {starPoints.map((pt) => renderStarCorners(pt.r, pt.c, pt.edge))}

          {/* River Calligraphy "楚 河" and "漢 界" */}
          <g className="font-serif-sc font-bold select-none pointer-events-none opacity-85">
            <text
              x={paddingX + 1.8 * cellW}
              y={paddingY + 4.65 * cellH}
              fill="#5c3a21"
              fontSize={cellH * 0.44}
              textAnchor="middle"
              dominantBaseline="middle"
              letterSpacing="0.4em"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              楚 河
            </text>
            <text
              x={paddingX + 6.2 * cellW}
              y={paddingY + 4.65 * cellH}
              fill="#5c3a21"
              fontSize={cellH * 0.44}
              textAnchor="middle"
              dominantBaseline="middle"
              letterSpacing="0.4em"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              漢 界
            </text>
          </g>

          {/* Last Move Indicator (From & To highlight squares) */}
          {lastMove && (
            <g>
              {(() => {
                const pFrom = getPixelPos(lastMove.from.r, lastMove.from.c);
                const pTo = getPixelPos(lastMove.to.r, lastMove.to.c);
                const radius = pieceSize * 0.52;
                return (
                  <>
                    <circle
                      cx={pFrom.x}
                      cy={pFrom.y}
                      r={radius}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      opacity="0.85"
                    />
                    <circle
                      cx={pTo.x}
                      cy={pTo.y}
                      r={radius}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* Hint Move Arrow */}
          {hintMove && (
            <g>
              {(() => {
                const p1 = getPixelPos(hintMove.from.r, hintMove.from.c);
                const p2 = getPixelPos(hintMove.to.r, hintMove.to.c);
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                const arrowLength = 12;
                const arrowAngle = Math.PI / 6;

                return (
                  <g className="animate-pulse">
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${p2.x} ${p2.y} L ${p2.x - arrowLength * Math.cos(angle - arrowAngle)} ${
                        p2.y - arrowLength * Math.sin(angle - arrowAngle)
                      } L ${p2.x - arrowLength * Math.cos(angle + arrowAngle)} ${
                        p2.y - arrowLength * Math.sin(angle + arrowAngle)
                      } Z`}
                      fill="#2563eb"
                    />
                  </g>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Board Intersections (Clickable Targets & Legal Move Indicators) */}
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 9 }).map((_, c) => {
            const { x, y } = getPixelPos(r, c);
            const isLegal = legalMoves.some((m) => m.r === r && m.c === c);
            const piece = board[r][c];
            const isSelected = selectedCoord?.r === r && selectedCoord?.c === c;
            const isLastFrom = lastMove?.from.r === r && lastMove?.from.c === c;
            const isLastTo = lastMove?.to.r === r && lastMove?.to.c === c;
            const isInCheck = inCheckColor !== null && piece?.type === 'k' && piece?.color === inCheckColor;

            return (
              <div
                key={`cell-${r}-${c}`}
                onClick={() => !disabled && onSquareClick(r, c)}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: `${cellW}px`,
                  height: `${cellH}px`,
                }}
                className="flex items-center justify-center cursor-pointer group"
              >
                {/* Piece on this intersection */}
                {piece && (
                  <PieceComponent
                    piece={piece}
                    isSelected={isSelected}
                    isLastMoveFrom={isLastFrom}
                    isLastMoveTo={isLastTo}
                    isInCheck={isInCheck}
                    size={pieceSize}
                  />
                )}

                {/* Legal Move Indicator (Empty intersection: small translucent circle) */}
                {isLegal && !piece && (
                  <div className="w-4 h-4 rounded-full bg-emerald-600/70 border-2 border-emerald-300 shadow-sm transition-transform duration-150 group-hover:scale-135 pointer-events-none z-10" />
                )}

                {/* Legal Move Indicator (Capture: glowing crimson target ring) */}
                {isLegal && piece && (
                  <div
                    style={{
                      width: `${pieceSize + 6}px`,
                      height: `${pieceSize + 6}px`,
                    }}
                    className="absolute rounded-full border-3 border-rose-500/90 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse pointer-events-none z-30"
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
