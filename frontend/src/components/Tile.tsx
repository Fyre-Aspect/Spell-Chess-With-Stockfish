import React from 'react';
import styles from './Tile.module.css';
import { Piece as PieceType } from '@/lib/chess/types';
import Piece from './Piece';

interface TileProps {
  piece: PieceType | null;
  isBlack: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isFrozen?: boolean;
  onClick: () => void;
}

export default function Tile({ piece, isBlack, isSelected, isLegalMove, isFrozen, onClick }: TileProps) {
  const classes = [
    styles.tile,
    isBlack ? styles.dark : styles.light,
    isSelected ? styles.selected : '',
    isFrozen ? styles.frozen : '',
    isLegalMove ? (piece ? styles.legalCapture : styles.legalMove) : ''
  ].join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {piece && <Piece type={piece.type} color={piece.color} />}
    </div>
  );
}
