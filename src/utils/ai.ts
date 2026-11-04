import { Board, Coordinate, Move, Piece, PieceColor, PieceType, AIDifficulty } from '../types/xiangqi';
import { cloneBoard, getAllLegalMoves, getLegalMovesForPiece, isKingInCheck, areKingsFacing, generateNotation } from './rules';

// Base piece values
const PIECE_VALUES: Record<PieceType, number> = {
  k: 10000,
  r: 1000,
  c: 500,
  n: 450,
  b: 220,
  a: 220,
  p: 100,
};

// Positional bonuses (Piece-Square Tables for Red; flipped for Black)
// 10 rows x 9 cols (row 0: top/black side, row 9: bottom/red side)
const PAWN_PST_RED = [
  [90, 90, 110, 120, 120, 120, 110, 90, 90], // Row 0 (bottom of black board)
  [90, 90, 110, 120, 120, 120, 110, 90, 90],
  [70, 90, 110, 110, 110, 110, 110, 90, 70],
  [70, 70, 90, 90, 90, 90, 90, 70, 70],
  [60, 60, 60, 60, 60, 60, 60, 60, 60], // Row 4 (crossed river)
  [0, 0, 0, 0, 0, 0, 0, 0, 0],           // Row 5 (river bank)
  [0, 0, 0, 10, 20, 10, 0, 0, 0],         // Row 6 (initial row)
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const HORSE_PST_RED = [
  [0, -10, 0, 0, 0, 0, 0, -10, 0],
  [0, 20, 30, 40, 30, 40, 30, 20, 0],
  [10, 30, 50, 60, 50, 60, 50, 30, 10],
  [10, 30, 40, 50, 50, 50, 40, 30, 10],
  [10, 20, 30, 40, 40, 40, 30, 20, 10],
  [0, 10, 20, 30, 30, 30, 20, 10, 0],
  [0, 0, 10, 20, 10, 20, 10, 0, 0],
  [-10, 0, 10, 10, 10, 10, 10, 0, -10],
  [-10, -10, 0, 0, 0, 0, 0, -10, -10],
  [-20, -10, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST_RED = [
  [14, 14, 14, 14, 16, 14, 14, 14, 14],
  [16, 24, 18, 24, 20, 24, 18, 24, 16],
  [12, 18, 16, 22, 18, 22, 16, 18, 12],
  [12, 18, 18, 20, 18, 20, 18, 18, 12],
  [14, 16, 16, 18, 18, 18, 16, 16, 14],
  [14, 14, 16, 18, 18, 18, 16, 14, 14],
  [12, 14, 14, 16, 16, 16, 14, 14, 12],
  [8, 12, 12, 14, 14, 14, 12, 12, 8],
  [4, 8, 8, 10, 10, 10, 8, 8, 4],
  [0, 2, 4, 6, 6, 6, 4, 2, 0],
];

const CANNON_PST_RED = [
  [6, 4, 0, -10, -12, -10, 0, 4, 6],
  [2, 2, 0, -4, -14, -4, 0, 2, 2],
  [2, 4, 8, 10, 10, 10, 8, 4, 2],
  [0, 2, 8, 10, 12, 10, 8, 2, 0],
  [0, 0, 2, 6, 10, 6, 2, 0, 0],
  [0, 0, 2, 4, 6, 4, 2, 0, 0],
  [0, 0, 0, 2, 4, 2, 0, 0, 0],
  [-2, 0, 4, 2, 0, 2, 4, 0, -2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function getPositionalValue(piece: Piece, r: number, c: number): number {
  const isRed = piece.color === 'red';
  const tableR = isRed ? r : 9 - r;
  const tableC = isRed ? c : 8 - c;

  switch (piece.type) {
    case 'p':
      return PAWN_PST_RED[tableR][tableC];
    case 'n':
      return HORSE_PST_RED[tableR][tableC];
    case 'r':
      return ROOK_PST_RED[tableR][tableC];
    case 'c':
      return CANNON_PST_RED[tableR][tableC];
    case 'b':
      return 15; // Moderate defense bonus
    case 'a':
      return 15; // Moderate palace guard bonus
    default:
      return 0;
  }
}

/**
 * Static board evaluation from the perspective of Red (positive = Red advantage, negative = Black advantage)
 */
export function evaluateBoard(board: Board): number {
  let score = 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type];
      const posVal = getPositionalValue(piece, r, c);
      const pieceTotal = baseVal + posVal;

      if (piece.color === 'red') {
        score += pieceTotal;
      } else {
        score -= pieceTotal;
      }
    }
  }

  return score;
}

/**
 * Move ordering function: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
 */
function scoreMove(board: Board, move: { from: Coordinate; to: Coordinate; piece: Piece }): number {
  const target = board[move.to.r][move.to.c];
  if (target) {
    return 1000 + PIECE_VALUES[target.type] * 10 - PIECE_VALUES[move.piece.type];
  }
  // Bonus for advancing pawns or active pieces
  return getPositionalValue(move.piece, move.to.r, move.to.c);
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean // true for Red, false for Black
): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const currentColor: PieceColor = isMaximizing ? 'red' : 'black';
  const legalMoves = getAllLegalMoves(board, currentColor);

  if (legalMoves.length === 0) {
    // No legal moves
    const inCheck = isKingInCheck(board, currentColor);
    if (inCheck) {
      // Checkmate!
      return isMaximizing ? -20000 + (4 - depth) : 20000 - (4 - depth);
    } else {
      // Stalemate (loss in Xiangqi)
      return isMaximizing ? -15000 : 15000;
    }
  }

  // Sort moves for better alpha-beta cutoff
  legalMoves.sort((a, b) => scoreMove(board, b) - scoreMove(board, a));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const tempBoard = cloneBoard(board);
      tempBoard[move.to.r][move.to.c] = tempBoard[move.from.r][move.from.c];
      tempBoard[move.from.r][move.from.c] = null;

      const evaluation = minimax(tempBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const tempBoard = cloneBoard(board);
      tempBoard[move.to.r][move.to.c] = tempBoard[move.from.r][move.from.c];
      tempBoard[move.from.r][move.from.c] = null;

      const evaluation = minimax(tempBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

export interface BestMoveResult {
  from: Coordinate;
  to: Coordinate;
  piece: Piece;
  score: number;
  notation: string;
}

/**
 * Finds the best move for the AI engine based on difficulty level
 */
export async function findBestMove(
  board: Board,
  aiColor: PieceColor,
  difficulty: AIDifficulty = 'medium'
): Promise<BestMoveResult | null> {
  const legalMoves = getAllLegalMoves(board, aiColor);
  if (legalMoves.length === 0) return null;

  const isMaximizing = aiColor === 'red';

  // Easy / Novice: depth 1 or 2 with occasional randomness
  if (difficulty === 'easy') {
    // 30% chance to pick a random move from the top captures or simple moves
    if (Math.random() < 0.35) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        ...randomMove,
        score: 0,
        notation: generateNotation(board, randomMove.from, randomMove.to),
      };
    }
  }

  const depthMap: Record<AIDifficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
    master: 4,
  };

  const depth = depthMap[difficulty] || 2;

  // Move ordering
  legalMoves.sort((a, b) => scoreMove(board, b) - scoreMove(board, a));

  let bestMove = legalMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  // Allow yielding to main thread so animations or loading state can render
  await new Promise(resolve => setTimeout(resolve, 60));

  for (const move of legalMoves) {
    const tempBoard = cloneBoard(board);
    tempBoard[move.to.r][move.to.c] = tempBoard[move.from.r][move.from.c];
    tempBoard[move.from.r][move.from.c] = null;

    const evalScore = minimax(tempBoard, depth - 1, alpha, beta, !isMaximizing);

    if (isMaximizing) {
      if (evalScore > bestScore) {
        bestScore = evalScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalScore);
    } else {
      if (evalScore < bestScore) {
        bestScore = evalScore;
        bestMove = move;
      }
      beta = Math.min(beta, evalScore);
    }
  }

  return {
    ...bestMove,
    score: bestScore,
    notation: generateNotation(board, bestMove.from, bestMove.to),
  };
}
