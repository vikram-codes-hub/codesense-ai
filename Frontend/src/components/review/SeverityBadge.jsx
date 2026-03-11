export default function SeverityBadge({ severity }) {
  const config = {
    critical: { label: '🔴 Critical', className: 'badge-critical' },
    high:     { label: '🟠 High',     className: 'badge-high' },
    medium:   { label: '🟡 Medium',   className: 'badge-medium' },
    low:      { label: '🔵 Low',      className: 'badge-low' },
  }
  const { label, className } = config[severity] || config.low
  return <span className={className}>{label}</span>
}