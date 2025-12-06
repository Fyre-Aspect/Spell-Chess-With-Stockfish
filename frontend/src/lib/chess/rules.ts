import { Board, Color, Move, PieceType, Square, CastlingRights } from './types';

export function isSquareOnBoard(sq: Square): boolean {
  return sq.row >= 0 && sq.row < 8 && sq.col >= 0 && sq.col < 8;
}

export function isSameSquare(s1: Square, s2: Square): boolean {
  return s1.row === s2.row && s1.col === s2.col;
}

export function getPieceAt(board: Board, sq: Square) {
  if (!isSquareOnBoard(sq)) return null;
  return board[sq.row][sq.col];
}

export function isSquareAttacked(board: Board, sq: Square, attackerColor: Color): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor) {
        // Pass empty castling rights to avoid recursion
        const moves = getPseudoLegalMoves(board, { row: r, col: c });
        if (moves.some(m => isSameSquare(m, sq))) {
          return true;
        }
      }
    }
  }
  return false;
}

function getSlidingMoves(board: Board, start: Square, dr: number, dc: number, ghostMode: boolean = false): Square[] {
  const moves: Square[] = [];
  const piece = getPieceAt(board, start);
  if (!piece) return moves;

  let r = start.row + dr;
  let c = start.col + dc;

  while (isSquareOnBoard({ row: r, col: c })) {
    const targetSq = { row: r, col: c };
    const targetPiece = getPieceAt(board, targetSq);

    if (!targetPiece) {
      moves.push(targetSq);
    } else {
      if (targetPiece.color !== piece.color) {
        moves.push(targetSq); // Capture
      }
      
      if (!ghostMode) {
        break; // Blocked
      }
      // If ghostMode, continue even if blocked (but can't land on own piece, which is handled by not pushing above)
    }
    r += dr;
    c += dc;
  }
  return moves;
}

function getKnightMoves(board: Board, start: Square): Square[] {
  const moves: Square[] = [];
  const piece = getPieceAt(board, start);
  if (!piece) return moves;

  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [dr, dc] of offsets) {
    const targetSq = { row: start.row + dr, col: start.col + dc };
    if (isSquareOnBoard(targetSq)) {
      const targetPiece = getPieceAt(board, targetSq);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(targetSq);
      }
    }
  }
  return moves;
}

function getKingMoves(board: Board, start: Square, castlingRights?: CastlingRights): Square[] {
  const moves: Square[] = [];
  const piece = getPieceAt(board, start);
  if (!piece) return moves;

  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of offsets) {
    const targetSq = { row: start.row + dr, col: start.col + dc };
    if (isSquareOnBoard(targetSq)) {
      const targetPiece = getPieceAt(board, targetSq);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(targetSq);
      }
    }
  }

  // Castling
  if (castlingRights) {
    const rights = castlingRights[piece.color];
    const row = piece.color === 'w' ? 7 : 0;
    const opponentColor = piece.color === 'w' ? 'b' : 'w';

    // King-side
    if (rights.k) {
      if (
        !getPieceAt(board, { row, col: 5 }) &&
        !getPieceAt(board, { row, col: 6 }) &&
        !isSquareAttacked(board, { row, col: 4 }, opponentColor) &&
        !isSquareAttacked(board, { row, col: 5 }, opponentColor) &&
        !isSquareAttacked(board, { row, col: 6 }, opponentColor)
      ) {
        moves.push({ row, col: 6 });
      }
    }

    // Queen-side
    if (rights.q) {
      if (
        !getPieceAt(board, { row, col: 1 }) &&
        !getPieceAt(board, { row, col: 2 }) &&
        !getPieceAt(board, { row, col: 3 }) &&
        !isSquareAttacked(board, { row, col: 4 }, opponentColor) &&
        !isSquareAttacked(board, { row, col: 3 }, opponentColor) &&
        !isSquareAttacked(board, { row, col: 2 }, opponentColor)
      ) {
        moves.push({ row, col: 2 });
      }
    }
  }

  return moves;
}

function getPawnMoves(board: Board, start: Square, ghostMode: boolean = false): Square[] {
  const moves: Square[] = [];
  const piece = getPieceAt(board, start);
  if (!piece) return moves;

  const direction = piece.color === 'w' ? -1 : 1;
  const startRow = piece.color === 'w' ? 6 : 1;

  // Forward 1
  const fwd1 = { row: start.row + direction, col: start.col };
  const fwd1Blocked = isSquareOnBoard(fwd1) && !!getPieceAt(board, fwd1);
  
  if (isSquareOnBoard(fwd1) && !fwd1Blocked) {
    moves.push(fwd1);
  }

  // Forward 2
  const fwd2 = { row: start.row + 2 * direction, col: start.col };
  if (start.row === startRow && isSquareOnBoard(fwd2)) {
    const fwd2Blocked = !!getPieceAt(board, fwd2);
    // Normal: Must be empty at fwd1 AND fwd2
    // Ghost: Must be empty at fwd2 (destination), but fwd1 can be occupied
    if (!fwd2Blocked && (!fwd1Blocked || ghostMode)) {
      moves.push(fwd2);
    }
  }

  // Captures
  const captureOffsets = [[direction, -1], [direction, 1]];
  for (const [dr, dc] of captureOffsets) {
    const targetSq = { row: start.row + dr, col: start.col + dc };
    if (isSquareOnBoard(targetSq)) {
      const targetPiece = getPieceAt(board, targetSq);
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push(targetSq);
      }
    }
  }

  return moves;
}

export function getPseudoLegalMoves(
  board: Board, 
  start: Square, 
  castlingRights?: CastlingRights,
  frozenPieces?: Set<string>,
  ghostMode: boolean = false
): Square[] {
  const piece = getPieceAt(board, start);
  if (!piece) return [];

  if (frozenPieces && frozenPieces.has(`${start.row},${start.col}`)) {
    return [];
  }

  switch (piece.type) {
    case 'p': return getPawnMoves(board, start, ghostMode); // Pawns don't slide, so ghostMode logic needs to be added to getPawnMoves too?
    case 'n': return getKnightMoves(board, start);
    case 'b': return [
      ...getSlidingMoves(board, start, -1, -1, ghostMode),
      ...getSlidingMoves(board, start, -1, 1, ghostMode),
      ...getSlidingMoves(board, start, 1, -1, ghostMode),
      ...getSlidingMoves(board, start, 1, 1, ghostMode)
    ];
    case 'r': return [
      ...getSlidingMoves(board, start, -1, 0, ghostMode),
      ...getSlidingMoves(board, start, 1, 0, ghostMode),
      ...getSlidingMoves(board, start, 0, -1, ghostMode),
      ...getSlidingMoves(board, start, 0, 1, ghostMode)
    ];
    case 'q': return [
      ...getSlidingMoves(board, start, -1, -1, ghostMode),
      ...getSlidingMoves(board, start, -1, 1, ghostMode),
      ...getSlidingMoves(board, start, 1, -1, ghostMode),
      ...getSlidingMoves(board, start, 1, 1, ghostMode),
      ...getSlidingMoves(board, start, -1, 0, ghostMode),
      ...getSlidingMoves(board, start, 1, 0, ghostMode),
      ...getSlidingMoves(board, start, 0, -1, ghostMode),
      ...getSlidingMoves(board, start, 0, 1, ghostMode)
    ];
    case 'k': return getKingMoves(board, start, castlingRights);
    default: return [];
  }
}

export function makeMove(board: Board, move: Move): Board {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;
  newBoard[move.to.row][move.to.col] = piece;
  
  // Handle promotion (auto-queen for now)
  if (piece && piece.type === 'p') {
    if ((piece.color === 'w' && move.to.row === 0) || (piece.color === 'b' && move.to.row === 7)) {
      newBoard[move.to.row][move.to.col] = { type: move.promotion || 'q', color: piece.color };
    }
  }

  // Handle Castling
  if (move.isCastling) {
    const row = move.to.row;
    if (move.to.col === 6) { // King-side
      const rook = newBoard[row][7];
      newBoard[row][7] = null;
      newBoard[row][5] = rook;
    } else if (move.to.col === 2) { // Queen-side
      const rook = newBoard[row][0];
      newBoard[row][0] = null;
      newBoard[row][3] = rook;
    }
  }
  
  return newBoard;
}

export function findKing(board: Board, color: Color): Square | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false; // Should not happen

  const opponentColor = color === 'w' ? 'b' : 'w';
  
  // Check if any opponent piece can attack the king
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        const moves = getPseudoLegalMoves(board, { row: r, col: c });
        if (moves.some(m => isSameSquare(m, kingPos))) {
          return true;
        }
      }
    }
  }
  return false;
}

export function getLegalMoves(
  board: Board, 
  start: Square, 
  castlingRights?: CastlingRights,
  frozenPieces?: Set<string>,
  ghostMode: boolean = false
): Square[] {
  const piece = getPieceAt(board, start);
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, start, castlingRights, frozenPieces, ghostMode);
  const legalMoves: Square[] = [];

  for (const target of pseudoMoves) {
    const isCastling = piece.type === 'k' && Math.abs(target.col - start.col) > 1;
    const move: Move = { from: start, to: target, isCastling };
    const newBoard = makeMove(board, move);
    
    // "King can be killed" rule:
    // We do NOT check if the move results in self-check.
    // We allow the move.
    legalMoves.push(target);
  }

  return legalMoves;
}

export function isCheckmate(board: Board, color: Color): boolean {
  if (!isCheck(board, color)) return false;
  
  // If any piece has a legal move, it's not checkmate
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, { row: r, col: c });
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
}
