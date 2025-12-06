'use client';

import React, { useEffect, useState } from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import ChessBoard from './ChessBoard';
import EvaluationBar from './EvaluationBar';
import { boardToFen, uciToMove } from '@/lib/chess/board';
import styles from './GameController.module.css';

type GameMode = 'menu' | 'pvp' | 'ai';

export default function GameController() {
  const { 
    board, turn, selectedSquare, legalMoves, gameStatus, handleSquareClick, executeMove, resetGame, castlingRights,
    spells, activateSpell, activeSpell, ghostMode, winner, frozenPieces
  } = useChessGame();
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
      <div className={styles.menuContainer}>
        <h2 className={styles.menuTitle}>Start New Game</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
          <button 
            onClick={() => handleStartGame('pvp')}
            className={styles.menuButton}
          >
            Player vs Player
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={() => handleStartGame('ai')}
              className={styles.menuButton}
            >
              Player vs AI
            </button>
            
            <div className={styles.difficultyContainer}>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0', fontWeight: 'bold' }}>
                <span>AI Difficulty (Depth)</span>
                <span>{difficulty}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={difficulty} 
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className={styles.rangeInput}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#aaa' }}>
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
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={`${styles.header} ${isFullscreen ? styles.headerFullscreen : ''}`}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleBackToMenu}
            className={styles.button}
          >
            ← Menu
          </button>
          <button 
            onClick={toggleFullscreen}
            className={styles.button}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ecca3' }}>
          {gameMode === 'pvp' ? 'PvP' : `PvAI (Lvl ${difficulty})`}
        </div>
        <div className={`${styles.turnIndicator} ${turn === 'w' ? styles.turnWhite : styles.turnBlack}`}>
          Turn: {turn === 'w' ? 'White' : 'Black'}
        </div>
      </div>
      
      <div className={`${styles.gameArea} ${isFullscreen ? styles.gameAreaFullscreen : ''}`}>
        <EvaluationBar evaluation={evaluation} mate={mate} />
        <div style={{ flex: 1, aspectRatio: '1', position: 'relative' }}>
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            onSquareClick={gameMode === 'ai' && turn === 'b' ? () => {} : handleSquareClick}
            frozenPieces={frozenPieces}
          />
          {gameStatus !== 'playing' && (
            <div className={styles.overlay}>
              {gameStatus === 'checkmate' ? `Checkmate! ${turn === 'w' ? 'Black' : 'White'} Wins!` : 
               gameStatus === 'stalemate' ? 'Stalemate!' : 
               gameStatus === 'king-captured' ? `King Captured! ${winner === 'w' ? 'White' : 'Black'} Wins!` : ''}
            </div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        {/* Spells */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => activateSpell('freeze')}
            disabled={!spells[turn].freeze.available || (gameMode === 'ai' && turn === 'b')}
            className={`${styles.button} ${activeSpell === 'freeze' ? styles.buttonActive : ''}`}
          >
            Freeze {activeSpell === 'freeze' ? '(Select Target)' : ''}
          </button>
          <button
            onClick={() => activateSpell('ghost')}
            disabled={!spells[turn].ghost.available || (gameMode === 'ai' && turn === 'b')}
            className={`${styles.button} ${ghostMode ? styles.buttonActive : ''}`}
          >
            Ghost Walk {ghostMode ? '(Active)' : ''}
          </button>
        </div>

        {isAiThinking && <div style={{ fontStyle: 'italic', fontSize: '1.1rem', color: '#aaa' }}>AI is thinking...</div>}
        {error && <div style={{ color: '#e94560' }}>{error}</div>}
        
        <button 
          onClick={resetGame} 
          className={`${styles.button} ${styles.buttonDanger}`}
        >
          Reset Board
        </button>
      </div>
    </div>
  );
}

// Removed menuButtonStyle as it is now in CSS module
