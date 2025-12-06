'use client';

import React, { useEffect, useState } from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import ChessBoard from './ChessBoard';
import EvaluationBar from './EvaluationBar';
import { boardToFen, uciToMove } from '@/lib/chess/board';

type GameMode = 'menu' | 'pvp' | 'ai';

export default function GameController() {
  const { board, turn, selectedSquare, legalMoves, gameStatus, handleSquareClick, executeMove, resetGame, castlingRights } = useChessGame();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState(10);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [evaluation, setEvaluation] = useState<number | null>(null);
  const [mate, setMate] = useState<number | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Fetch evaluation for player's turn or PvP
  useEffect(() => {
    const isAiTurn = gameMode === 'ai' && turn === 'b';
    if (!isAiTurn && gameStatus === 'playing') {
       const getEval = async () => {
         try {
           const fen = boardToFen(board, turn, castlingRights);
           const response = await fetch(`/api/move?fen=${encodeURIComponent(fen)}&depth=10`);
           const data = await response.json();
           if (data.success) {
             setEvaluation(data.evaluation);
             setMate(data.mate);
           }
         } catch (e) {
           console.error("Eval fetch failed", e);
         }
       };
       getEval();
    }
  }, [board, turn, castlingRights, gameStatus, gameMode]);

  useEffect(() => {
    if (gameMode === 'ai' && turn === 'b' && gameStatus === 'playing') {
      const makeAiMove = async () => {
        setIsAiThinking(true);
        setError(null);
        try {
          const fen = boardToFen(board, 'b', castlingRights);
          const response = await fetch(`/api/move?fen=${encodeURIComponent(fen)}&depth=${difficulty}`);
          
          if (!response.ok) {
             throw new Error('Network response was not ok');
          }

          const data = await response.json();
          
          if (data.success) {
             setEvaluation(data.evaluation);
             setMate(data.mate);
          }

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
  }, [turn, gameStatus, board, executeMove, gameMode, difficulty, castlingRights]);

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
    setEvaluation(0); // Reset eval
    setMate(null);
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
    resetGame();
    setError(null);
    setIsAiThinking(false);
  };

  if (gameMode === 'menu') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '30px', 
        padding: '40px',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '2rem', margin: 0, color: '#333' }}>Start New Game</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
          <button 
            onClick={() => handleStartGame('pvp')}
            style={menuButtonStyle}
          >
            Player vs Player
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={() => handleStartGame('ai')}
              style={menuButtonStyle}
            >
              Player vs AI
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', backgroundColor: '#eee', borderRadius: '8px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontWeight: 'bold' }}>
                <span>AI Difficulty (Depth)</span>
                <span>{difficulty}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={difficulty} 
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777' }}>
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '20px', 
      padding: isFullscreen ? '0' : '20px', 
      width: '100%',
      height: isFullscreen ? '100vh' : 'auto',
      justifyContent: isFullscreen ? 'center' : 'flex-start',
      backgroundColor: isFullscreen ? '#222' : 'transparent'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%', 
        maxWidth: isFullscreen ? '90vh' : '800px', 
        alignItems: 'center',
        color: isFullscreen ? '#fff' : '#333'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleBackToMenu}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            ← Menu
          </button>
          <button 
            onClick={toggleFullscreen}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isFullscreen ? '#fff' : '#333' }}>
          {gameMode === 'pvp' ? 'PvP' : `PvAI (Lvl ${difficulty})`}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: turn === 'w' ? '#d4a017' : (isFullscreen ? '#ccc' : '#333') }}>
          Turn: {turn === 'w' ? 'White' : 'Black'}
        </div>
      </div>
      
      <div style={{ position: 'relative', width: '100%', maxWidth: isFullscreen ? '85vh' : '800px', display: 'flex', gap: '20px' }}>
        <EvaluationBar evaluation={evaluation} mate={mate} />
        <div style={{ flex: 1, aspectRatio: '1' }}>
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            onSquareClick={gameMode === 'ai' && turn === 'b' ? () => {} : handleSquareClick}
          />
          {gameStatus !== 'playing' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.85)',
              color: 'white',
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              {gameStatus === 'checkmate' ? `Checkmate! ${turn === 'w' ? 'Black' : 'White'} Wins!` : 
               gameStatus === 'stalemate' ? 'Stalemate!' : 
               gameStatus === 'draw' ? 'Draw!' : ''}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {isAiThinking && <div style={{ fontStyle: 'italic', fontSize: '1.1rem', color: isFullscreen ? '#ccc' : '#555' }}>AI is thinking...</div>}
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
          Reset Board
        </button>
      </div>
    </div>
  );
}

const menuButtonStyle = {
  padding: '15px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  backgroundColor: '#333',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  transition: 'background-color 0.2s',
  width: '100%'
} as React.CSSProperties;
