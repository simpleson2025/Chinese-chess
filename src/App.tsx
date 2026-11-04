import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Board, 
  Coordinate, 
  Move, 
  Piece, 
  PieceColor, 
  GameMode, 
  AIDifficulty, 
  GameStatus, 
  AnalysisResult 
} from './types/xiangqi';
import { 
  createInitialBoard, 
  cloneBoard, 
  getLegalMovesForPiece, 
  getAllLegalMoves, 
  isKingInCheck, 
  generateNotation, 
  PIECE_NAMES 
} from './utils/rules';
import { findBestMove, evaluateBoard } from './utils/ai';
import { sounds } from './utils/audio';
import { ChessBoard } from './components/ChessBoard';
import { GameHUD } from './components/GameHUD';
import { ControlPanel } from './components/ControlPanel';
import { MoveHistory } from './components/MoveHistory';
import { RulesModal } from './components/RulesModal';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { Trophy, RefreshCw, Swords } from 'lucide-react';

export default function App() {
  // Game Board State
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [history, setHistory] = useState<Move[]>([]);
  const [historyBoards, setHistoryBoards] = useState<Board[]>(() => [createInitialBoard()]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1); // -1 = live latest

  // Game Settings & Mode
  const [gameMode, setGameMode] = useState<GameMode>('pve');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Interaction State
  const [turn, setTurn] = useState<PieceColor>('red');
  const [selectedCoord, setSelectedCoord] = useState<Coordinate | null>(null);
  const [legalMoves, setLegalMoves] = useState<Coordinate[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Coordinate; to: Coordinate } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Status & Outcomes
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [inCheckColor, setInCheckColor] = useState<PieceColor | null>(null);

  // Captured Pieces
  const [capturedRed, setCapturedRed] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  // Ref to prevent race conditions during AI turns
  const isAiWorkingRef = useRef(false);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  // Reset or start a new game
  const handleRestart = useCallback(() => {
    const freshBoard = createInitialBoard();
    setBoard(freshBoard);
    setHistory([]);
    setHistoryBoards([freshBoard]);
    setCurrentMoveIndex(-1);
    setTurn('red');
    setSelectedCoord(null);
    setLegalMoves([]);
    setLastMove(null);
    setHintMove(null);
    setIsAiThinking(false);
    setGameStatus('playing');
    setWinner(null);
    setInCheckColor(null);
    setCapturedRed([]);
    setCapturedBlack([]);
    isAiWorkingRef.current = false;
  }, []);

  // Make a move
  const executeMove = useCallback((from: Coordinate, to: Coordinate) => {
    setBoard((prevBoard) => {
      const movingPiece = prevBoard[from.r][from.c];
      if (!movingPiece) return prevBoard;

      const capturedPiece = prevBoard[to.r][to.c];
      const notation = generateNotation(prevBoard, from, to);

      // Create new board
      const newBoard = cloneBoard(prevBoard);
      newBoard[to.r][to.c] = movingPiece;
      newBoard[from.r][from.c] = null;

      // Sound feedback
      if (capturedPiece) {
        sounds.playCapture();
        if (capturedPiece.color === 'red') {
          setCapturedRed((prev) => [...prev, capturedPiece]);
        } else {
          setCapturedBlack((prev) => [...prev, capturedPiece]);
        }
      } else {
        sounds.playMove();
      }

      // Check next player's status
      const nextColor: PieceColor = movingPiece.color === 'red' ? 'black' : 'red';
      const oppInCheck = isKingInCheck(newBoard, nextColor);
      const oppLegalMoves = getAllLegalMoves(newBoard, nextColor);

      let nextGameStatus: GameStatus = 'playing';
      let nextWinner: PieceColor | null = null;
      let checkAlert: PieceColor | null = null;

      if (oppInCheck) {
        checkAlert = nextColor;
        if (oppLegalMoves.length === 0) {
          // Checkmate!
          nextGameStatus = 'checkmate';
          nextWinner = movingPiece.color;
          sounds.playVictory();
        } else {
          nextGameStatus = 'check';
          sounds.playCheck();
        }
      } else {
        if (oppLegalMoves.length === 0) {
          // Stalemate (困毙)!
          nextGameStatus = 'stalemate';
          nextWinner = movingPiece.color;
          sounds.playVictory();
        } else {
          nextGameStatus = 'playing';
        }
      }

      const moveObj: Move = {
        from,
        to,
        piece: movingPiece,
        captured: capturedPiece,
        notation,
        isCheck: oppInCheck,
        timestamp: Date.now(),
      };

      setHistory((prev) => [...prev, moveObj]);
      setHistoryBoards((prev) => [...prev, newBoard]);
      setLastMove(moveObj);
      setHintMove(null);
      setSelectedCoord(null);
      setLegalMoves([]);
      setTurn(nextColor);
      setGameStatus(nextGameStatus);
      setWinner(nextWinner);
      setInCheckColor(checkAlert);

      return newBoard;
    });
  }, []);

  // Square click handling
  const handleSquareClick = (r: number, c: number) => {
    // If reviewing past moves, return to live game on click
    if (currentMoveIndex !== -1) {
      setCurrentMoveIndex(-1);
      return;
    }

    if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'conceded') {
      return;
    }

    if (isAiThinking || (gameMode === 'pve' && turn === 'black')) {
      return;
    }

    const clickedPiece = board[r][c];

    // Case 1: An owned piece is clicked -> Select it and compute legal moves
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedCoord({ r, c });
      const moves = getLegalMovesForPiece(board, { r, c });
      setLegalMoves(moves);
      setHintMove(null);
      return;
    }

    // Case 2: Selected piece exists and clicked square is among legal destinations -> Move!
    if (selectedCoord) {
      const isDestinationLegal = legalMoves.some((m) => m.r === r && m.c === c);
      if (isDestinationLegal) {
        executeMove(selectedCoord, { r, c });
      } else {
        // Deselect
        setSelectedCoord(null);
        setLegalMoves([]);
      }
    }
  };

  // AI Turn handling
  useEffect(() => {
    if (
      gameMode === 'pve' &&
      turn === 'black' &&
      (gameStatus === 'playing' || gameStatus === 'check') &&
      !isAiWorkingRef.current &&
      currentMoveIndex === -1
    ) {
      isAiWorkingRef.current = true;
      setIsAiThinking(true);

      const delay = aiDifficulty === 'easy' ? 400 : aiDifficulty === 'medium' ? 600 : 750;

      const timer = setTimeout(async () => {
        try {
          const aiMove = await findBestMove(board, 'black', aiDifficulty);
          if (aiMove) {
            executeMove(aiMove.from, aiMove.to);
          } else {
            // No moves available -> stalemate or checkmate
            const inCheck = isKingInCheck(board, 'black');
            setGameStatus(inCheck ? 'checkmate' : 'stalemate');
            setWinner('red');
            sounds.playVictory();
          }
        } finally {
          setIsAiThinking(false);
          isAiWorkingRef.current = false;
        }
      }, delay);

      return () => {
        clearTimeout(timer);
        isAiWorkingRef.current = false;
      };
    }
  }, [turn, gameMode, gameStatus, board, aiDifficulty, currentMoveIndex, executeMove]);

  // Undo (悔棋)
  const handleUndo = () => {
    if (history.length === 0 || isAiThinking) return;

    if (gameMode === 'pve') {
      // In PvE, if it's currently player's turn, undo 2 steps (AI's move + Player's move)
      const stepsToUndo = turn === 'red' ? Math.min(2, history.length) : 1;
      const targetIndex = history.length - stepsToUndo;

      const newHistory = history.slice(0, targetIndex);
      const newHistoryBoards = historyBoards.slice(0, targetIndex + 1);
      const restoredBoard = newHistoryBoards[newHistoryBoards.length - 1];

      // Recompute captured pieces
      const newCapturedRed: Piece[] = [];
      const newCapturedBlack: Piece[] = [];
      newHistory.forEach((m) => {
        if (m.captured) {
          if (m.captured.color === 'red') newCapturedRed.push(m.captured);
          else newCapturedBlack.push(m.captured);
        }
      });

      setHistory(newHistory);
      setHistoryBoards(newHistoryBoards);
      setBoard(restoredBoard);
      setCapturedRed(newCapturedRed);
      setCapturedBlack(newCapturedBlack);
      setTurn('red');
      setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null);
      setSelectedCoord(null);
      setLegalMoves([]);
      setHintMove(null);
      setGameStatus('playing');
      setWinner(null);
      setInCheckColor(isKingInCheck(restoredBoard, 'red') ? 'red' : null);
      setCurrentMoveIndex(-1);
    } else {
      // In PvP, undo 1 step
      const targetIndex = history.length - 1;
      const newHistory = history.slice(0, targetIndex);
      const newHistoryBoards = historyBoards.slice(0, targetIndex + 1);
      const restoredBoard = newHistoryBoards[newHistoryBoards.length - 1];
      const prevTurn: PieceColor = turn === 'red' ? 'black' : 'red';

      const newCapturedRed: Piece[] = [];
      const newCapturedBlack: Piece[] = [];
      newHistory.forEach((m) => {
        if (m.captured) {
          if (m.captured.color === 'red') newCapturedRed.push(m.captured);
          else newCapturedBlack.push(m.captured);
        }
      });

      setHistory(newHistory);
      setHistoryBoards(newHistoryBoards);
      setBoard(restoredBoard);
      setCapturedRed(newCapturedRed);
      setCapturedBlack(newCapturedBlack);
      setTurn(prevTurn);
      setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null);
      setSelectedCoord(null);
      setLegalMoves([]);
      setHintMove(null);
      setGameStatus('playing');
      setWinner(null);
      setInCheckColor(isKingInCheck(restoredBoard, prevTurn) ? prevTurn : null);
      setCurrentMoveIndex(-1);
    }
  };

  // Hint (支招)
  const handleHint = async () => {
    if (isAiThinking || (gameStatus !== 'playing' && gameStatus !== 'check')) return;
    const best = await findBestMove(board, turn, 'master');
    if (best) {
      setHintMove({ from: best.from, to: best.to });
      setSelectedCoord(best.from);
      setLegalMoves(getLegalMovesForPiece(board, best.from));
    }
  };

  // Resign (认输)
  const handleResign = () => {
    if (gameStatus !== 'playing' && gameStatus !== 'check') return;
    const oppWinner: PieceColor = turn === 'red' ? 'black' : 'red';
    setGameStatus('conceded');
    setWinner(oppWinner);
    sounds.playVictory();
  };

  // Jump to historic move
  const handleJumpToMove = (index: number) => {
    if (index === -1 || index >= history.length - 1) {
      setCurrentMoveIndex(-1);
      setBoard(historyBoards[historyBoards.length - 1]);
    } else {
      setCurrentMoveIndex(index);
      setBoard(historyBoards[index + 1]);
      setSelectedCoord(null);
      setLegalMoves([]);
      setHintMove(null);
    }
  };

  // AI Grandmaster Strategic Analysis via Gemini API
  const handleOpenAnalysis = async () => {
    setIsAnalysisOpen(true);
    setIsAnalysisLoading(true);

    try {
      // Build board state text description
      let pieceSummary = '';
      const redPieces: string[] = [];
      const blackPieces: string[] = [];

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
          const p = board[r][c];
          if (p) {
            const name = PIECE_NAMES[p.color][p.type];
            const coordStr = `(${r},${c})`;
            if (p.color === 'red') redPieces.push(`${name}${coordStr}`);
            else blackPieces.push(`${name}${coordStr}`);
          }
        }
      }

      pieceSummary = `红方存活棋子：${redPieces.join('、')}\n黑方存活棋子：${blackPieces.join('、')}`;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardDesc: pieceSummary,
          turn,
          history: history.map((m) => m.notation),
          difficulty: aiDifficulty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
      } else {
        throw new Error('Analysis request failed');
      }
    } catch {
      // Heuristic fallback
      const evalScore = evaluateBoard(board) / 100;
      setAnalysisData({
        evaluation: evalScore > 1 ? '红方略优' : evalScore < -1 ? '黑方占优' : '局势均势',
        score: evalScore,
        tacticalAdvice: '当前双方子力交织，宜抢占河头要道，注意车马炮协同，避免孤军深入被对方穿宫偷袭。',
        threats: ['严防对方快马抢挂角', '防范对方中炮暗伏'],
        suggestedPlan: '巩固九宫联防，稳扎稳打，寻找边路突破良机。',
      });
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // Active board to display (live board or historical review board)
  const displayBoard = currentMoveIndex === -1 ? board : historyBoards[currentMoveIndex + 1];

  return (
    <div className="min-h-screen bg-[#141210] text-[#f4efe8] flex flex-col justify-between selection:bg-amber-800 selection:text-white">
      {/* Top Bar (Strict 3-Zone Top Bar Contract) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-stone-800 bg-[#191613]/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single Brand wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/40 flex items-center justify-center shadow-sm">
            <span className="font-serif-sc font-black text-amber-100 text-base leading-none">
              楚
            </span>
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-100 font-serif-sc">
            华夏象棋
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-400">
          <button
            onClick={() => {
              setGameMode('pve');
              handleRestart();
            }}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            人机对战
          </button>
          <button
            onClick={() => {
              setGameMode('pvp');
              handleRestart();
            }}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            双人同屏
          </button>
          <button
            onClick={() => setIsRulesOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            走子规则
          </button>
          <button
            onClick={handleOpenAnalysis}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            AI棋圣解析
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <RefreshCw size={13} />
            <span>开始新局</span>
          </button>
        </div>
      </header>

      {/* Main Chess Arena */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-4 flex flex-col items-center justify-center">
        {/* Game HUD (Turn, timers, captured pieces) */}
        <GameHUD
          turn={turn}
          gameMode={gameMode}
          aiDifficulty={aiDifficulty}
          gameStatus={gameStatus}
          winner={winner}
          isAiThinking={isAiThinking}
          capturedRed={capturedRed}
          capturedBlack={capturedBlack}
          moveCount={history.length}
        />

        {/* Main Chess Board */}
        <div className="relative">
          <ChessBoard
            board={displayBoard}
            selectedCoord={currentMoveIndex === -1 ? selectedCoord : null}
            legalMoves={currentMoveIndex === -1 ? legalMoves : []}
            lastMove={lastMove}
            hintMove={hintMove}
            inCheckColor={inCheckColor}
            flipped={isFlipped}
            onSquareClick={handleSquareClick}
            disabled={currentMoveIndex !== -1}
          />

          {/* Historical Review Floating Banner */}
          {currentMoveIndex !== -1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-stone-900/95 border border-amber-600/80 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium text-amber-300 z-40 backdrop-blur-md">
              <span>正在复盘第 {currentMoveIndex + 1} 着</span>
              <button
                onClick={() => setCurrentMoveIndex(-1)}
                className="underline hover:text-white font-bold ml-1 text-xs"
              >
                返回当前对局
              </button>
            </div>
          )}
        </div>

        {/* Game Controls Panel (Mode, difficulty, undo, hint, flip, restart) */}
        <ControlPanel
          gameMode={gameMode}
          aiDifficulty={aiDifficulty}
          soundEnabled={soundEnabled}
          canUndo={history.length > 0 && currentMoveIndex === -1}
          isAiThinking={isAiThinking}
          isFlipped={isFlipped}
          onSetGameMode={(m) => {
            setGameMode(m);
            handleRestart();
          }}
          onSetDifficulty={(d) => setAiDifficulty(d)}
          onUndo={handleUndo}
          onHint={handleHint}
          onFlipBoard={() => setIsFlipped((prev) => !prev)}
          onRestart={handleRestart}
          onResign={handleResign}
          onToggleSound={handleToggleSound}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenAnalysis={handleOpenAnalysis}
        />

        {/* Traditional Move Notation History */}
        <MoveHistory
          history={history}
          currentMoveIndex={currentMoveIndex}
          onJumpToMove={handleJumpToMove}
        />
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-stone-800/80 bg-[#161311] text-center text-xs text-stone-500">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span>华夏传统象棋 · 楚河汉界</span>
          <span>支持人机算力对弈与本地双人对战</span>
        </div>
      </footer>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* AI Grandmaster Strategic Analysis Modal */}
      <AIAnalysisModal
        isOpen={isAnalysisOpen}
        isLoading={isAnalysisLoading}
        analysis={analysisData}
        onClose={() => setIsAnalysisOpen(false)}
        onReAnalyze={handleOpenAnalysis}
      />
    </div>
  );
}
