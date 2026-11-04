import { Board, Coordinate, Move, Piece, PieceColor, PieceType } from '../types/xiangqi';

export const PIECE_NAMES: Record<PieceColor, Record<PieceType, string>> = {
  red: {
    k: '帥',
    a: '仕',
    b: '相',
    n: '傌',
    r: '俥',
    c: '砲',
    p: '兵',
  },
  black: {
    k: '將',
    a: '士',
    b: '象',
    n: '馬',
    r: '車',
    c: '炮',
    p: '卒',
  },
};

export const CHINESE_NUMS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const ARABIC_FULL_NUMS = ['１', '２', '３', '４', '５', '６', '７', '８', '９'];

export function createInitialBoard(): Board {
  const board: Board = Array(10).fill(null).map(() => Array(9).fill(null));

  const addPiece = (r: number, c: number, type: PieceType, color: PieceColor) => {
    board[r][c] = {
      id: `${color}-${type}-${r}-${c}`,
      type,
      color,
    };
  };

  // Black pieces (top: rows 0-3)
  const backRow: PieceType[] = ['r', 'n', 'b', 'a', 'k', 'a', 'b', 'n', 'r'];
  for (let c = 0; c < 9; c++) {
    addPiece(0, c, backRow[c], 'black');
  }
  addPiece(2, 1, 'c', 'black');
  addPiece(2, 7, 'c', 'black');
  for (let c = 0; c < 9; c += 2) {
    addPiece(3, c, 'p', 'black');
  }

  // Red pieces (bottom: rows 6-9)
  for (let c = 0; c < 9; c++) {
    addPiece(9, c, backRow[c], 'red');
  }
  addPiece(7, 1, 'c', 'red');
  addPiece(7, 7, 'c', 'red');
  for (let c = 0; c < 9; c += 2) {
    addPiece(6, c, 'p', 'red');
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function isValidCoord(r: number, c: number): boolean {
  return r >= 0 && r < 10 && c >= 0 && c < 9;
}

export function isInsidePalace(r: number, c: number, color: PieceColor): boolean {
  if (c < 3 || c > 5) return false;
  if (color === 'red') {
    return r >= 7 && r <= 9;
  } else {
    return r >= 0 && r <= 2;
  }
}

export function findKing(board: Board, color: PieceColor): Coordinate | null {
  const minR = color === 'red' ? 7 : 0;
  const maxR = color === 'red' ? 9 : 2;
  for (let r = minR; r <= maxR; r++) {
    for (let c = 3; c <= 5; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return { r, c };
      }
    }
  }
  return null;
}

/**
 * Checks if the two Kings/Generals face each other directly in the same column with no pieces in between
 */
export function areKingsFacing(board: Board): boolean {
  const redKing = findKing(board, 'red');
  const blackKing = findKing(board, 'black');
  if (!redKing || !blackKing) return false;
  if (redKing.c !== blackKing.c) return false;

  const col = redKing.c;
  for (let r = blackKing.r + 1; r < redKing.r; r++) {
    if (board[r][col] !== null) {
      return false;
    }
  }
  return true;
}

/**
 * Generates pseudo-legal moves for a specific piece at (fromR, fromC)
 */
export function getPseudoMoves(board: Board, from: Coordinate): Coordinate[] {
  const piece = board[from.r][from.c];
  if (!piece) return [];

  const moves: Coordinate[] = [];
  const { r, c } = from;
  const color = piece.color;
  const oppColor: PieceColor = color === 'red' ? 'black' : 'red';

  const checkAndAdd = (nr: number, nc: number) => {
    if (!isValidCoord(nr, nc)) return;
    const dest = board[nr][nc];
    if (!dest || dest.color === oppColor) {
      moves.push({ r: nr, c: nc });
    }
  };

  switch (piece.type) {
    case 'k': {
      // General moves 1 step orthogonally within palace
      const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInsidePalace(nr, nc, color)) {
          checkAndAdd(nr, nc);
        }
      }
      break;
    }

    case 'a': {
      // Advisor moves 1 step diagonally within palace
      const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInsidePalace(nr, nc, color)) {
          checkAndAdd(nr, nc);
        }
      }
      break;
    }

    case 'b': {
      // Elephant moves 2 steps diagonally, cannot cross river, blocked by eye
      const deltas = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        // Cannot cross river
        if (color === 'red' && nr < 5) continue;
        if (color === 'black' && nr > 4) continue;
        if (!isValidCoord(nr, nc)) continue;

        // Eye check (塞象眼)
        const eyeR = r + dr / 2;
        const eyeC = c + dc / 2;
        if (board[eyeR][eyeC] === null) {
          checkAndAdd(nr, nc);
        }
      }
      break;
    }

    case 'n': {
      // Horse moves 1 orthogonally then 1 diagonally (蹩马腿)
      const horseMoves: [number, number, number, number][] = [
        // [dr, dc, legR_offset, legC_offset]
        [-2, -1, -1, 0],
        [-2, 1, -1, 0],
        [2, -1, 1, 0],
        [2, 1, 1, 0],
        [-1, -2, 0, -1],
        [1, -2, 0, -1],
        [-1, 2, 0, 1],
        [1, 2, 0, 1],
      ];

      for (const [dr, dc, legDr, legDc] of horseMoves) {
        const nr = r + dr;
        const nc = c + dc;
        const legR = r + legDr;
        const legC = c + legDc;
        if (isValidCoord(legR, legC) && board[legR][legC] === null) {
          checkAndAdd(nr, nc);
        }
      }
      break;
    }

    case 'r': {
      // Rook/Chariot moves along rank/file
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (isValidCoord(nr, nc)) {
          const dest = board[nr][nc];
          if (!dest) {
            moves.push({ r: nr, c: nc });
          } else {
            if (dest.color === oppColor) {
              moves.push({ r: nr, c: nc });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'c': {
      // Cannon moves like Rook when empty; requires exactly 1 screen to capture
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        let hasScreen = false;
        while (isValidCoord(nr, nc)) {
          const dest = board[nr][nc];
          if (!hasScreen) {
            if (!dest) {
              moves.push({ r: nr, c: nc });
            } else {
              hasScreen = true; // Found screen piece
            }
          } else {
            if (dest) {
              if (dest.color === oppColor) {
                moves.push({ r: nr, c: nc });
              }
              break; // Cannon can only jump one screen
            }
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'p': {
      // Soldier/Pawn
      const isCrossed = color === 'red' ? r <= 4 : r >= 5;
      const forwardDr = color === 'red' ? -1 : 1;

      // Forward step
      checkAndAdd(r + forwardDr, c);

      // Sideways steps after crossing river
      if (isCrossed) {
        checkAndAdd(r, c - 1);
        checkAndAdd(r, c + 1);
      }
      break;
    }
  }

  return moves;
}

/**
 * Checks if the King of the specified color is under attack
 */
export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const king = findKing(board, color);
  if (!king) return true; // If King is missing, consider in check

  // Check flying generals
  if (areKingsFacing(board)) {
    return true;
  }

  const oppColor: PieceColor = color === 'red' ? 'black' : 'red';

  // Check if any opponent piece can hit the king's coordinate
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.color === oppColor) {
        const moves = getPseudoMoves(board, { r, c });
        if (moves.some(m => m.r === king.r && m.c === king.c)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Generates all strictly legal moves for a given piece (does not leave own King in check)
 */
export function getLegalMovesForPiece(board: Board, from: Coordinate): Coordinate[] {
  const piece = board[from.r][from.c];
  if (!piece) return [];

  const pseudoMoves = getPseudoMoves(board, from);
  const legalMoves: Coordinate[] = [];

  for (const to of pseudoMoves) {
    // Test move on temporary board
    const tempBoard = cloneBoard(board);
    tempBoard[to.r][to.c] = tempBoard[from.r][from.c];
    tempBoard[from.r][from.c] = null;

    if (!isKingInCheck(tempBoard, piece.color) && !areKingsFacing(tempBoard)) {
      legalMoves.push(to);
    }
  }

  return legalMoves;
}

/**
 * Generates all strictly legal moves for all pieces of a given color
 */
export function getAllLegalMoves(board: Board, color: PieceColor): { from: Coordinate; to: Coordinate; piece: Piece }[] {
  const allMoves: { from: Coordinate; to: Coordinate; piece: Piece }[] = [];

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const destinations = getLegalMovesForPiece(board, { r, c });
        for (const to of destinations) {
          allMoves.push({
            from: { r, c },
            to,
            piece: p,
          });
        }
      }
    }
  }

  return allMoves;
}

/**
 * Format traditional Chinese chess notation (e.g. 炮二平五, 马８进７)
 */
export function generateNotation(board: Board, from: Coordinate, to: Coordinate): string {
  const piece = board[from.r][from.c];
  if (!piece) return '';

  const isRed = piece.color === 'red';
  const name = PIECE_NAMES[piece.color][piece.type];

  // Column numbering:
  // Red: from right to left (col 8 is 1, col 0 is 9) -> 9 - col
  // Black: from right to left (col 0 is 1, col 8 is 9) -> col + 1
  const getColName = (c: number, useArabic = false) => {
    if (isRed) {
      const colNum = 9 - c; // 1 to 9
      return CHINESE_NUMS[colNum - 1];
    } else {
      const colNum = c + 1; // 1 to 9
      return useArabic ? ARABIC_FULL_NUMS[colNum - 1] : CHINESE_NUMS[colNum - 1];
    }
  };

  // Check if multiple identical pieces in same column (e.g. 前炮/后炮, 前车/后车)
  let prefix = name;
  const sameColPieces: { r: number; c: number }[] = [];
  for (let r = 0; r < 10; r++) {
    const p = board[r][from.c];
    if (p && p.color === piece.color && p.type === piece.type) {
      sameColPieces.push({ r, c: from.c });
    }
  }

  if (sameColPieces.length === 2 && piece.type !== 'b' && piece.type !== 'a' && piece.type !== 'k') {
    // Sort by row
    sameColPieces.sort((a, b) => a.r - b.r);
    const isFront = isRed ? from.r === sameColPieces[0].r : from.r === sameColPieces[1].r;
    prefix = isFront ? `前${name}` : `后${name}`;
  } else {
    prefix = `${name}${getColName(from.c, !isRed)}`;
  }

  // Action direction & destination
  let action = '';
  let target = '';

  const dr = to.r - from.r;
  const isAdvancing = isRed ? dr < 0 : dr > 0;
  const isRetreating = isRed ? dr > 0 : dr < 0;

  if (dr === 0) {
    action = '平';
    target = getColName(to.c, !isRed);
  } else if (isAdvancing) {
    action = '进';
    if (piece.type === 'n' || piece.type === 'b' || piece.type === 'a') {
      target = getColName(to.c, !isRed);
    } else {
      const steps = Math.abs(dr);
      target = isRed ? CHINESE_NUMS[steps - 1] : ARABIC_FULL_NUMS[steps - 1];
    }
  } else if (isRetreating) {
    action = '退';
    if (piece.type === 'n' || piece.type === 'b' || piece.type === 'a') {
      target = getColName(to.c, !isRed);
    } else {
      const steps = Math.abs(dr);
      target = isRed ? CHINESE_NUMS[steps - 1] : ARABIC_FULL_NUMS[steps - 1];
    }
  }

  return `${prefix}${action}${target}`;
}
