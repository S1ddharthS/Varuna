import { useState } from 'react';
import './App.css';
import { usePositions } from './hooks/usePositions';
import { useAlerts } from './hooks/useAlerts';
import { useMetrics } from './hooks/useMetrics';
import MapView from './components/MapView';
import MetricsPanel from './components/MetricsPanel';
import AlertPanel from './components/AlertPanel';
import JitterControl from './components/JitterControl';
import Toast from './components/Toast';

const POSITIONS_URL = 'http://localhost:8080/ws/positions';
const ALERTS_URL = 'http://localhost:8080/ws/alerts';
const METRICS_URL = 'http://localhost:8080/api/metrics';

function App() {
  const { status: positionsStatus, geoJson: positionsGeoJson } = usePositions(POSITIONS_URL);
  const { status: alertsStatus, alerts, droppedCount } = useAlerts(ALERTS_URL);
  const metrics = useMetrics(METRICS_URL);
  
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  
  if (typeof window !== 'undefined') {
    window.__alerts = alerts;
    window.__selectedAlertId = selectedAlertId;
    window.__selectAlert = setSelectedAlertId;
  }
  
  const isConnected = positionsStatus === 'CONNECTED' && alertsStatus === 'CONNECTED';

  return (
    <div className="app-container">
      {!isConnected && (
        <div className="connecting-overlay">
          Connecting to Varuna Engine...
        </div>
      )}

      {/* Top Tactical Command Header */}
      <header className="top-command-bar">
        <div className="brand-section">
          <div className="radar-icon">⚓</div>
          <div>
            <div className="system-title">VARUNA // MARITIME SURVEILLANCE CORE</div>
            <div className="system-subtitle">DEFENSE RECONNAISSANCE · REAL-TIME AIS ANOMALY DETECTION · ZERO-BROKER REFLEX</div>
          </div>
        </div>

        <div className="status-badges">
          <div className="status-chip chip-green">
            <span className="dot pulse-green"></span>
            <span>INGESTION: ACTIVE</span>
          </div>
          <div className="status-chip chip-blue">
            <span>INDEX: O(1) SPATIAL GRID</span>
          </div>
          <div className="status-chip chip-purple">
            <span>CORROBORATION: SENTINEL-1 SAR</span>
          </div>
        </div>
      </header>

      <div className="map-layer">
        <MapView 
          positionsGeoJson={positionsGeoJson} 
          alerts={alerts}
          selectedAlertId={selectedAlertId}
        />
      </div>

      <div className="ui-layer">
        <div className="left-panel">
          <MetricsPanel metrics={metrics} />
        </div>
        
        <div className="right-panel">
          <AlertPanel 
            alerts={alerts} 
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
          />
        </div>
        
        <div className="debug-control-layer">
          <JitterControl />
        </div>
        
        <div className="toast-container">
          <Toast droppedCount={droppedCount} />
        </div>
      </div>
    </div>
  );
}

export default App;
