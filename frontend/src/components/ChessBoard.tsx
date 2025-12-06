import React from 'react';
import styles from './ChessBoard.module.css';
import { Board, Square } from '@/lib/chess/types';
import Tile from './Tile';
import { isSameSquare } from '@/lib/chess/rules';

interface ChessBoardProps {
  board: Board;
  selectedSquare: Square | null;
  legalMoves: Square[];
  onSquareClick: (row: number, col: number) => void;
}

export default function ChessBoard({ board, selectedSquare, legalMoves, onSquareClick }: ChessBoardProps) {
  return (
    <div className={styles.board}>
      {board.map((row, rowIndex) => (
        row.map((piece, colIndex) => {
          const isBlack = (rowIndex + colIndex) % 2 === 1;
          const square = { row: rowIndex, col: colIndex };
          const isSelected = selectedSquare ? isSameSquare(selectedSquare, square) : false;
          const isLegalMove = legalMoves.some(m => isSameSquare(m, square));

          return (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              piece={piece}
              isBlack={isBlack}
              isSelected={isSelected}
              isLegalMove={isLegalMove}
              onClick={() => onSquareClick(rowIndex, colIndex)}
            />
          );
        })
      ))}
    </div>
  );
}
