import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MetricsPanel({ metrics }) {
  const chartData = {
    labels: metrics.history.map((_, i) => i),
    datasets: [
      {
        label: 'p50 Latency (ms)',
        data: metrics.history.map(m => m.p50_latency_ms),
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf8',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'p99 Latency (ms)',
        data: metrics.history.map(m => m.p99_latency_ms),
        borderColor: '#f43f5e',
        backgroundColor: '#f43f5e',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: '#cbd5e1', 
          font: { size: 10, family: 'Inter, sans-serif' },
          boxWidth: 12
        } 
      }
    },
    scales: {
      x: { display: false },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  const triggerEvent = async (eventName) => {
    try {
      await fetch(`http://localhost:8080/api/trigger/${eventName}`, { method: 'POST' });
    } catch (e) {
      console.error('Trigger failed:', e);
    }
  };

  return (
    <div className="glass-panel metrics-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.1em' }}>
            ENGINE TELEMETRY
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
            VARUNA CORE
          </div>
        </div>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: '700', 
          padding: '3px 8px', 
          borderRadius: '4px',
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
          LIVE PIPELINE
        </span>
      </div>

      {/* Throughput Metric */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            Sustained Throughput
          </span>
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '600' }}>ZERO BROKER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' }}>
            {Math.round(metrics.throughput_per_sec).toLocaleString()}
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>msgs / sec</span>
        </div>
      </div>
      
      {/* Latency Graph */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            End-to-End Latency
          </span>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600', fontFamily: 'monospace' }}>
            p50: {metrics.p50_latency_ms?.toFixed(1) || '0'}ms | p99: {metrics.p99_latency_ms?.toFixed(1) || '0'}ms
          </span>
        </div>
        <div style={{ height: '110px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Scenario Triggers */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Simulate Tactical Scenarios
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button 
            onClick={() => triggerEvent('dark_transit')}
            style={{ 
              padding: '6px 8px', 
              fontSize: '11px', 
              fontWeight: '600', 
              borderRadius: '4px', 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#fbbf24', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer'
            }}
          >
            ⚡ Dark Transit
          </button>
          <button 
            onClick={() => triggerEvent('mmsi_conflict')}
            style={{ 
              padding: '6px 8px', 
              fontSize: '11px', 
              fontWeight: '600', 
              borderRadius: '4px', 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#f87171', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer'
            }}
          >
            ⚡ MMSI Spoof
          </button>
          <button 
            onClick={() => triggerEvent('loiter')}
            style={{ 
              padding: '6px 8px', 
              fontSize: '11px', 
              fontWeight: '600', 
              borderRadius: '4px', 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: '#38bdf8', 
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer'
            }}
          >
            ⚡ Loitering MPA
          </button>
          <button 
            onClick={() => triggerEvent('boundary_jitter')}
            style={{ 
              padding: '6px 8px', 
              fontSize: '11px', 
              fontWeight: '600', 
              borderRadius: '4px', 
              background: 'rgba(168, 85, 247, 0.15)', 
              color: '#c084fc', 
              border: '1px solid rgba(168, 85, 247, 0.3)',
              cursor: 'pointer'
            }}
          >
            ⚡ Boundary Jitter
          </button>
        </div>
      </div>
    </div>
  );
}
