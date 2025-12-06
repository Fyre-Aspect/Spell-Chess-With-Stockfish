export type Color = 'w' | 'b';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Board = (Piece | null)[][];

export interface Square {
  row: number;
  col: number;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  isCastling?: boolean;
}

export interface CastlingRights {
  w: { k: boolean, q: boolean };
  b: { k: boolean, q: boolean };
}

export interface GameState {
  board: Board;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  history: Move[];
  fen: string;
  castlingRights: CastlingRights;
}
