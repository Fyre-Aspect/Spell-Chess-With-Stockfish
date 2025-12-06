import { Board, Color, Piece, PieceType } from './types';

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function createEmptyBoard(): Board {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

export function getPieceTypeFromChar(char: string): PieceType {
  switch (char.toLowerCase()) {
    case 'p': return 'p';
    case 'n': return 'n';
    case 'b': return 'b';
    case 'r': return 'r';
    case 'q': return 'q';
    case 'k': return 'k';
    default: throw new Error(`Invalid piece char: ${char}`);
  }
}

export function getCharFromPiece(piece: Piece): string {
  const char = piece.type;
  return piece.color === 'w' ? char.toUpperCase() : char.toLowerCase();
}

export function fenToBoard(fen: string): Board {
  const board = createEmptyBoard();
  const [position] = fen.split(' ');
  const rows = position.split('/');

  rows.forEach((rowStr, rowIndex) => {
    let colIndex = 0;
    for (const char of rowStr) {
      if (/\d/.test(char)) {
        colIndex += parseInt(char, 10);
      } else {
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = getPieceTypeFromChar(char);
        board[rowIndex][colIndex] = { type, color };
        colIndex++;
      }
    }
  });

  return board;
}

export function boardToFen(board: Board, turn: Color = 'w', castling = '-', enPassant = '-', halfMove = 0, fullMove = 1): string {
  let fen = '';
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += getCharFromPiece(piece);
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    if (row < 7) {
      fen += '/';
    }
  }

  return `${fen} ${turn} ${castling} ${enPassant} ${halfMove} ${fullMove}`;
}

export function uciToMove(uci: string): { from: { row: number, col: number }, to: { row: number, col: number }, promotion?: PieceType } {
  const fromFile = uci.charCodeAt(0) - 'a'.charCodeAt(0);
  const fromRank = parseInt(uci[1]);
  const toFile = uci.charCodeAt(2) - 'a'.charCodeAt(0);
  const toRank = parseInt(uci[3]);
  
  const promotion = uci.length > 4 ? getPieceTypeFromChar(uci[4]) : undefined;

  return {
    from: { row: 8 - fromRank, col: fromFile },
    to: { row: 8 - toRank, col: toFile },
    promotion
  };
}

export const initialBoard = fenToBoard(STARTING_FEN);
