import { mockLiveFeed } from '../../utils/mockData'
import { useEffect, useRef } from 'react'

const eventConfig = {
  'review:queued':    { color: 'var(--accent)',   dot: '#6366f1', label: 'Queued' },
  'review:started':   { color: 'var(--medium)',   dot: '#eab308', label: 'Started' },
  'review:file:done': { color: 'var(--text-secondary)', dot: '#8b949e', label: 'File Done' },
  'review:complete':  { color: 'var(--grade-a)',  dot: '#22c55e', label: 'Complete' },
  'review:failed':    { color: 'var(--critical)', dot: '#ef4444', label: 'Failed' },
  'review:posted':    { color: 'var(--low)',       dot: '#3b82f6', label: 'Posted' },
}

export default function LiveFeed({ events = mockLiveFeed }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Live dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--grade-a)',
          boxShadow: '0 0 6px #22c55e',
          animation: 'pulseGlow 2s ease-in-out infinite',
        }} />
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Live Feed
        </h3>
      </div>

      {/* Events */}
      <div style={{
        padding: 12,
        maxHeight: 220,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {events.map((event) => {
          const config = eventConfig[event.event] || eventConfig['review:file:done']
          return (
            <div key={event.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              animation: 'slideIn 0.3s ease-out',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: config.dot,
                marginTop: 5, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                {event.time}
              </span>
              <span style={{ fontSize: 11, color: config.color, lineHeight: 1.4 }}>
                {event.message}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}