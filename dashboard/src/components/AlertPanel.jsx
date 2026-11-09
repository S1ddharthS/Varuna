import AlertDetail from './AlertDetail';

export default function AlertPanel({ alerts, selectedAlertId, onSelectAlert }) {
  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour12: false });
    } catch {
      return 'NOW';
    }
  };

  const getBadgeStyle = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('dark')) {
      return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' };
    }
    if (t.includes('conflict') || t.includes('fraud') || t.includes('mmsi')) {
      return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.5)' };
    }
    if (t.includes('geofence') || t.includes('breach')) {
      return { background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.4)' };
    }
    if (t.includes('fishing')) {
      return { background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' };
    }
    return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' };
  };

  const formatType = (type) => {
    if (!type) return 'ALERT';
    return type.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="glass-panel alerts-container">
      <div style={{ 
        padding: '14px 16px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#ef4444',
            boxShadow: '0 0 8px #ef4444' 
          }} />
          <h2 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.05em', color: '#f8fafc', margin: 0 }}>
            TACTICAL INCIDENT FEED
          </h2>
        </div>
        <span style={{ 
          fontSize: '11px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '2px 8px', 
          borderRadius: '12px',
          color: '#cbd5e1'
        }}>
          {alerts.length} Active
        </span>
      </div>
      
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
            Scanning Indian Ocean AIS feeds...<br />
            No active maritime anomalies detected.
          </div>
        ) : (
          alerts.map((alert, index) => {
            const isSelected = selectedAlertId === alert.alert_id;
            const badgeStyle = getBadgeStyle(alert.type);
            const conf = Math.round((alert.confidence || 0.95) * 100);

            return (
              <div key={alert.alert_id || index} style={{ marginBottom: '8px' }}>
                <div 
                  onClick={() => onSelectAlert(isSelected ? null : alert.alert_id)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.65)',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      ...badgeStyle
                    }}>
                      {formatType(alert.type)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ color: '#f1f5f9' }}>
                      Vessel: <strong style={{ color: '#38bdf8' }}>{alert.vessel_id}</strong>
                    </span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: conf >= 90 ? '#ef4444' : (conf >= 70 ? '#f59e0b' : '#10b981')
                    }}>
                      {conf}% Confidence
                    </span>
                  </div>

                  {alert.zone && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Sector: <span style={{ color: '#e2e8f0' }}>{alert.zone}</span>
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <AlertDetail 
                    alert={alert} 
                    getFormatClass={() => ''} 
                    formatType={formatType} 
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
