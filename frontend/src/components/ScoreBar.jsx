import React from 'react'

export default function ScoreBar({ score, showLabel = true }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--blue)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}`, transition: 'width 0.6s ease' }} />
      </div>
      {showLabel && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{score}</span>}
    </div>
  )
}
