import { useState, useCallback, useEffect } from 'react';
import { Board, Color, Move, Square, Piece, CastlingRights } from '@/lib/chess/types';
import { initialBoard, boardToFen, fenToBoard } from '@/lib/chess/board';
import { getLegalMoves, makeMove, isCheckmate, isCheck, isSameSquare, findKing } from '@/lib/chess/rules';

export interface SpellState {
  freeze: { available: boolean };
  ghost: { available: boolean };
}

export function useChessGame() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<Color>('w');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'king-captured'>('playing');
  const [history, setHistory] = useState<Move[]>([]);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    w: { k: true, q: true },
    b: { k: true, q: true }
  });

  // Spells State
  const [spells, setSpells] = useState<{ w: SpellState, b: SpellState }>({
    w: { freeze: { available: true }, ghost: { available: true } },
    b: { freeze: { available: true }, ghost: { available: true } }
  });
  const [frozenPieces, setFrozenPieces] = useState<Map<string, number>>(new Map()); // coord -> half-moves remaining
  const [activeSpell, setActiveSpell] = useState<'freeze' | null>(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);

  const getFrozenSet = useCallback(() => {
    const set = new Set<string>();
    frozenPieces.forEach((turns, key) => {
      if (turns > 0) set.add(key);
    });
    return set;
  }, [frozenPieces]);

  const activateSpell = useCallback((spell: 'freeze' | 'ghost') => {
    if (!spells[turn][spell].available) return;
    
    if (spell === 'ghost') {
      setGhostMode(true);
      setSpells(prev => ({
        ...prev,
        [turn]: { ...prev[turn], ghost: { available: false } }
      }));
    } else if (spell === 'freeze') {
      setActiveSpell('freeze');
    }
  }, [turn, spells]);

  const executeMove = useCallback((move: Move) => {
    setBoard(prevBoard => {
      const newBoard = makeMove(prevBoard, move);
      
      // Check for King Capture (Game Over)
      const opponentColor = turn === 'w' ? 'b' : 'w';
      const opponentKing = findKing(newBoard, opponentColor);
      
      if (!opponentKing) {
        setGameStatus('king-captured');
        setWinner(turn);
      }
      
      return newBoard;
    });

    // Update castling rights
    setCastlingRights(prev => {
      const newRights = { ...prev, w: { ...prev.w }, b: { ...prev.b } };
      const piece = board[move.from.row][move.from.col];
      
      if (piece?.type === 'k') {
        newRights[piece.color] = { k: false, q: false };
      } else if (piece?.type === 'r') {
        if (move.from.col === 0) newRights[piece.color].q = false;
        if (move.from.col === 7) newRights[piece.color].k = false;
      }
      
      // Also if rook is captured
      const targetPiece = board[move.to.row][move.to.col];
      if (targetPiece?.type === 'r') {
         if (move.to.col === 0) newRights[targetPiece.color].q = false;
         if (move.to.col === 7) newRights[targetPiece.color].k = false;
      }

      return newRights;
    });
    
    // Decrement frozen counters
    setFrozenPieces(prev => {
      const newMap = new Map();
      prev.forEach((turns, key) => {
        if (turns > 1) newMap.set(key, turns - 1);
      });
      return newMap;
    });

    // Reset Ghost Mode
    if (ghostMode) {
      setGhostMode(false);
    }

    setTurn(prev => prev === 'w' ? 'b' : 'w');
    setHistory(prev => [...prev, move]);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [turn, board, ghostMode]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;

    // Handle Freeze Spell Targeting
    if (activeSpell === 'freeze') {
      const piece = board[row][col];
      if (piece) {
        setFrozenPieces(prev => {
          const newMap = new Map(prev);
          newMap.set(`${row},${col}`, 4); // Freeze for 4 half-moves (2 turns)
          return newMap;
        });
        setSpells(prev => ({
          ...prev,
          [turn]: { ...prev[turn], freeze: { available: false } }
        }));
        setActiveSpell(null);
      }
      return;
    }

    const clickedSquare: Square = { row, col };
    const piece = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
      // If clicking the same square, deselect
      if (isSameSquare(selectedSquare, clickedSquare)) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking a legal move target, make the move
      if (legalMoves.some(m => isSameSquare(m, clickedSquare))) {
        const selectedPiece = board[selectedSquare.row][selectedSquare.col];
        const isCastling = selectedPiece?.type === 'k' && Math.abs(clickedSquare.col - selectedSquare.col) > 1;
        const move: Move = { from: selectedSquare, to: clickedSquare, isCastling };
        executeMove(move);
        return;
      }

      // If clicking another own piece, select it instead
      if (piece && piece.color === turn) {
        setSelectedSquare(clickedSquare);
        setLegalMoves(getLegalMoves(board, clickedSquare, castlingRights, getFrozenSet(), ghostMode));
        return;
      }

      // If clicking empty or enemy piece (not a legal move), deselect
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // If no square selected, select own piece
      if (piece && piece.color === turn) {
        setSelectedSquare(clickedSquare);
        setLegalMoves(getLegalMoves(board, clickedSquare, castlingRights, getFrozenSet(), ghostMode));
      }
    }
  }, [board, turn, selectedSquare, legalMoves, gameStatus, executeMove, castlingRights, activeSpell, spells, getFrozenSet, ghostMode]);

  const resetGame = useCallback(() => {
    setBoard(initialBoard);
    setTurn('w');
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameStatus('playing');
    setHistory([]);
    setCastlingRights({ w: { k: true, q: true }, b: { k: true, q: true } });
    setSpells({
      w: { freeze: { available: true }, ghost: { available: true } },
      b: { freeze: { available: true }, ghost: { available: true } }
    });
    setFrozenPieces(new Map());
    setGhostMode(false);
    setWinner(null);
    setActiveSpell(null);
  }, []);

  return {
    board,
    turn,
    selectedSquare,
    legalMoves,
    gameStatus,
    handleSquareClick,
    executeMove,
    resetGame,
    history,
    castlingRights,
    spells,
    activateSpell,
    activeSpell,
    ghostMode,
    winner,
    frozenPieces
  };
}
