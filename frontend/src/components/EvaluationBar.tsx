import React from 'react';

interface EvaluationBarProps {
  evaluation: number | null;
  mate: number | null;
}

export default function EvaluationBar({ evaluation, mate }: EvaluationBarProps) {
  let whitePercentage = 50;
  let text = "0.0";

  if (mate !== null) {
    if (mate > 0) {
      whitePercentage = 100;
      text = `M${mate}`;
    } else {
      whitePercentage = 0;
      text = `M${Math.abs(mate)}`;
    }
  } else if (evaluation !== null) {
    // Sigmoid-like mapping for visual bar
    // 1 / (1 + e^(-0.5 * eval))
    whitePercentage = (1 / (1 + Math.exp(-0.5 * evaluation))) * 100;
    text = evaluation > 0 ? `+${evaluation}` : `${evaluation}`;
  }

  return (
    <div style={{ 
      width: '40px', 
      height: '100%', 
      backgroundColor: '#444', 
      display: 'flex', 
      flexDirection: 'column-reverse',
      border: '2px solid #222',
      borderRadius: '4px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <div style={{ 
        width: '100%', 
        height: `${whitePercentage}%`, 
        backgroundColor: '#eee',
        transition: 'height 0.5s ease-in-out'
      }} />
      <div style={{
        position: 'absolute',
        top: whitePercentage > 50 ? 'auto' : '5px',
        bottom: whitePercentage > 50 ? '5px' : 'auto',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: whitePercentage > 50 ? '#333' : '#eee',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        pointerEvents: 'none'
      }}>
        {text}
      </div>
    </div>
  );
}
