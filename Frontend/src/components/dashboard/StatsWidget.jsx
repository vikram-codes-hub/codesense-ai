import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatsWidget({ title, value, subtitle, icon: Icon, iconColor, change }) {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${iconColor}18`,
          border: `1px solid ${iconColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={iconColor} />
        </div>
        {change !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500,
            color: isPositive ? 'var(--grade-a)' : isNegative ? 'var(--critical)' : 'var(--text-muted)',
          }}>
            {isPositive ? <TrendingUp size={13} /> : isNegative ? <TrendingDown size={13} /> : null}
            {change > 0 ? `+${change}` : change}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}