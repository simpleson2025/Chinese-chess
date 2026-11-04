export type PieceColor = 'red' | 'black';

export type PieceType = 
  | 'k' // King / General (帅 / 将)
  | 'a' // Advisor (仕 / 士)
  | 'b' // Elephant / Bishop (相 / 象)
  | 'n' // Knight / Horse (傌 / 马)
  | 'r' // Rook / Chariot (俥 / 车)
  | 'c' // Cannon (砲 / 炮)
  | 'p'; // Pawn / Soldier (兵 / 卒)

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
}

export interface Coordinate {
  r: number; // 0 to 9 (0 is Black top, 9 is Red bottom)
  c: number; // 0 to 8 (0 is left, 8 is right from Red's perspective)
}

export interface Move {
  from: Coordinate;
  to: Coordinate;
  piece: Piece;
  captured?: Piece | null;
  notation: string;
  isCheck?: boolean;
  timestamp?: number;
}

export type Board = (Piece | null)[][];

export type GameMode = 'pve' | 'pvp'; // Player vs AI or Player vs Player
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'conceded' | 'draw';

export interface GameSettings {
  soundEnabled: boolean;
  autoFlipBoard: boolean;
  showLegalMoves: boolean;
  showLastMove: boolean;
  aiDifficulty: AIDifficulty;
  playerColor: PieceColor; // In PvE: which side the human plays
}

export interface AnalysisResult {
  evaluation: string; // e.g. "红方大优 (+3.5)" or "势均力敌"
  score: number; // Centipawn or material equivalent
  bestMove?: {
    from: Coordinate;
    to: Coordinate;
    notation: string;
  };
  tacticalAdvice: string;
  threats: string[];
  suggestedPlan: string;
}
