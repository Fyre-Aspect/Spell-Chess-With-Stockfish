'use client';

import React, { useEffect, useState } from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import ChessBoard from './ChessBoard';
import { boardToFen, uciToMove } from '@/lib/chess/board';

export default function GameController() {
  const { board, turn, selectedSquare, legalMoves, gameStatus, handleSquareClick, executeMove, resetGame } = useChessGame();
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (turn === 'b' && gameStatus === 'playing') {
      const makeAiMove = async () => {
        setIsAiThinking(true);
        setError(null);
        try {
          const fen = boardToFen(board, 'b');
          // Use internal API route instead of external Python backend
          const response = await fetch(`/api/move?fen=${encodeURIComponent(fen)}&depth=10`);
          
          if (!response.ok) {
             throw new Error('Network response was not ok');
          }

          const data = await response.json();
          
          if (data.success && data.bestmove) {
             const bestMoveStr = data.bestmove;
             const moveStr = bestMoveStr.startsWith('bestmove') ? bestMoveStr.split(' ')[1] : bestMoveStr;
             const move = uciToMove(moveStr);
             // Add a small delay for realism
             setTimeout(() => {
                executeMove(move);
                setIsAiThinking(false);
             }, 500);
          } else {
             throw new Error(data.error || 'Unknown error from AI');
          }
        } catch (e) {
          console.error(e);
          setError('Failed to get AI move');
          setIsAiThinking(false);
        }
      };
      makeAiMove();
    }
  }, [turn, gameStatus, board, executeMove]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '600px' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Turn: {turn === 'w' ? 'White' : 'Black'}</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Status: {gameStatus.toUpperCase()}</div>
      </div>
      
      <ChessBoard
        board={board}
        selectedSquare={selectedSquare}
        legalMoves={legalMoves}
        onSquareClick={handleSquareClick}
      />

      {isAiThinking && <div style={{ fontStyle: 'italic' }}>AI is thinking...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button 
        onClick={resetGame} 
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          cursor: 'pointer',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Reset Game
      </button>
    </div>
  );
}
