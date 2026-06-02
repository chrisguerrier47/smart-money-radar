import React from 'react'

const BADGES = {
  insider_buy:   { label: 'INSIDER BUY',   bg: 'rgba(0,230,118,0.12)',  color: 'var(--green)',  border: 'rgba(0,230,118,0.3)' },
  insider_sell:  { label: 'INSIDER SELL',  bg: 'rgba(255,71,87,0.1)',   color: 'var(--red)',    border: 'rgba(255,71,87,0.3)' },
  activist_13d:  { label: 'ACTIVIST 13D',  bg: 'rgba(255,171,0,0.12)',  color: 'var(--amber)',  border: 'rgba(255,171,0,0.3)' },
  activist_13g:  { label: 'ACTIVIST 13G',  bg: 'rgba(255,171,0,0.08)',  color: 'var(--amber)',  border: 'rgba(255,171,0,0.2)' },
  news_positive: { label: 'NEWS +',        bg: 'rgba(0,230,118,0.08)',  color: 'var(--green)',  border: 'rgba(0,230,118,0.2)' },
  news_negative: { label: 'NEWS −',        bg: 'rgba(255,71,87,0.08)',  color: 'var(--red)',    border: 'rgba(255,71,87,0.2)' },
}

export default function SignalBadge({ type, small = false }) {
  const cfg = BADGES[type] || { label: (type || 'UNKNOWN').toUpperCase(), bg: 'rgba(122,154,184,0.1)', color: 'var(--text-secondary)', border: 'rgba(122,154,184,0.2)' }
  return (
    <span style={{
      display: 'inline-block',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: 3, padding: small ? '1px 6px' : '2px 8px',
      fontSize: small ? 10 : 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.05em', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
