import React from 'react';
import { Color, PieceType } from '@/lib/chess/types';

interface PieceProps {
  type: PieceType;
  color: Color;
}

const pieces: Record<string, React.ReactNode> = {
  'wp': <svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  'wn': <svg viewBox="0 0 45 45"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" /></svg>, // Simplified placeholder
  'wb': <svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M9 36c3.39-.47 5.5-2 5.5-5.43 0-3.86-1.3-3.86-1.3-7.29 0-4.14 2.94-7.29 9.3-7.29 6.36 0 9.3 3.15 9.3 7.29 0 3.43-1.3 3.43-1.3 7.29 0 3.43 2.11 4.96 5.5 5.43" /><path d="M15 32c2.5 2.5 12.5 2.5 15 0" /></g></svg>, // Simplified
  'wr': <svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M12 14h21v3H12zM12 17v15h21V17H12z" /></g></svg>,
  'wq': <svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11z" /><path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" /></g></svg>,
  'wk': <svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M22.5 11.63V6M20 8h5" /><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" /><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-8 12H13.5c-3-6.5-4-13-8-12-3 6 6 10.5 6 10.5v7z" /></g></svg>,
  'bp': <svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  'bn': <svg viewBox="0 0 45 45"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  'bb': <svg viewBox="0 0 45 45"><g fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M9 36c3.39-.47 5.5-2 5.5-5.43 0-3.86-1.3-3.86-1.3-7.29 0-4.14 2.94-7.29 9.3-7.29 6.36 0 9.3 3.15 9.3 7.29 0 3.43-1.3 3.43-1.3 7.29 0 3.43 2.11 4.96 5.5 5.43" /><path d="M15 32c2.5 2.5 12.5 2.5 15 0" /></g></svg>,
  'br': <svg viewBox="0 0 45 45"><g fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M12 14h21v3H12zM12 17v15h21V17H12z" /></g></svg>,
  'bq': <svg viewBox="0 0 45 45"><g fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11z" /><path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" /></g></svg>,
  'bk': <svg viewBox="0 0 45 45"><g fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M22.5 11.63V6M20 8h5" /><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" /><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-8 12H13.5c-3-6.5-4-13-8-12-3 6 6 10.5 6 10.5v7z" /></g></svg>,
};

export default function Piece({ type, color }: PieceProps) {
  const key = color + type;
  return (
    <div style={{ width: '80%', height: '80%' }}>
      {pieces[key] || null}
    </div>
  );
}
