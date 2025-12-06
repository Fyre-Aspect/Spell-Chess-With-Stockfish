import { useState, useCallback, useEffect } from 'react';
import { Board, Color, Move, Square, Piece, CastlingRights } from '@/lib/chess/types';
import { initialBoard, boardToFen, fenToBoard } from '@/lib/chess/board';
import { getLegalMoves, makeMove, isCheckmate, isCheck, isSameSquare } from '@/lib/chess/rules';

export function useChessGame() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<Color>('w');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate'>('playing');
  const [history, setHistory] = useState<Move[]>([]);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    w: { k: true, q: true },
    b: { k: true, q: true }
  });

  const executeMove = useCallback((move: Move) => {
    setBoard(prevBoard => {
      const newBoard = makeMove(prevBoard, move);
      
      // Check for game over based on the NEW board
      const nextTurn = turn === 'w' ? 'b' : 'w';
      if (isCheckmate(newBoard, nextTurn)) {
        setGameStatus('checkmate');
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
    
    setTurn(prev => prev === 'w' ? 'b' : 'w');
    setHistory(prev => [...prev, move]);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [turn, board]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;

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
        setLegalMoves(getLegalMoves(board, clickedSquare, castlingRights));
        return;
      }

      // If clicking empty or enemy piece (not a legal move), deselect
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // If no square selected, select own piece
      if (piece && piece.color === turn) {
        setSelectedSquare(clickedSquare);
        setLegalMoves(getLegalMoves(board, clickedSquare, castlingRights));
      }
    }
  }, [board, turn, selectedSquare, legalMoves, gameStatus, executeMove, castlingRights]);

  const resetGame = useCallback(() => {
    setBoard(initialBoard);
    setTurn('w');
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameStatus('playing');
    setHistory([]);
    setCastlingRights({ w: { k: true, q: true }, b: { k: true, q: true } });
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
    castlingRights
  };
}
