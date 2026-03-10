import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from 'chart.js'
import { mockActivityChart } from '../../utils/mockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function ActivityChart() {
  const data = {
    labels: mockActivityChart.map(d => d.date),
    datasets: [{
      label: 'Score',
      data: mockActivityChart.map(d => d.score),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#0d1117',
      pointBorderWidth: 2,
      tension: 0.4,
      fill: true,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        borderWidth: 1,
        titleColor: '#8b949e',
        bodyColor: '#e6edf3',
        padding: 10,
        callbacks: {
          label: (ctx) => ` Score: ${ctx.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(48,54,61,0.5)' },
        ticks: { color: '#484f58', font: { size: 11 } },
      },
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(48,54,61,0.5)' },
        ticks: { color: '#484f58', font: { size: 11 }, stepSize: 25 },
      },
    },
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Score Trend</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Review scores over time</div>
        </div>
        <div style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 6,
          background: 'rgba(99,102,241,0.1)', color: 'var(--accent)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          Last 30 days
        </div>
      </div>
      <div style={{ height: 200 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}