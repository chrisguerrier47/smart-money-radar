import React from 'react'

const BADGES = {
  insider_buy:   { label: 'Insider Buy',   bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'rgba(29,131,72,0.15)' },
  insider_sell:  { label: 'Insider Sell',  bg: 'var(--red-bg)',    color: 'var(--red)',    border: 'rgba(192,57,43,0.15)' },
  activist_13d:  { label: 'Activist 13D',  bg: 'var(--amber-bg)',  color: 'var(--amber)',  border: 'rgba(154,103,0,0.15)' },
  activist_13g:  { label: 'Activist 13G',  bg: 'var(--amber-bg)',  color: 'var(--amber)',  border: 'rgba(154,103,0,0.15)' },
  news_positive: { label: 'News +',        bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'rgba(29,131,72,0.15)' },
  news_negative: { label: 'News −',        bg: 'var(--red-bg)',    color: 'var(--red)',    border: 'rgba(192,57,43,0.15)' },
}

export default function SignalBadge({ type, small = false }) {
  const cfg = BADGES[type] || { label: type || 'Unknown', bg: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)', border: 'rgba(0,0,0,0.08)' }
  return (
    <span style={{
      display: 'inline-block',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: 6, padding: small ? '2px 8px' : '3px 10px',
      fontSize: small ? 11 : 12, fontWeight: 500, whiteSpace: 'nowrap',
      letterSpacing: '-0.01em',
    }}>
      {cfg.label}
    </span>
  )
}
