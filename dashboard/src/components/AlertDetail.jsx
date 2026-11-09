import { translateReasoning } from '../utils/reasoningTrace';
import { exportLeadPackage } from '../utils/exportLead';

export default function AlertDetail({ alert, formatType }) {
  const reasoningText = translateReasoning(alert.reasoning_trace, alert.evidence || {});
  const corroborationStatus = alert.corroboration?.status || 'none';
  const corroborationSource = alert.corroboration?.source;
  const alertType = alert.type || 'UNKNOWN';

  return (
    <div style={{ 
      margin: '8px 0 16px 0', 
      padding: '16px', 
      backgroundColor: 'rgba(15, 23, 42, 0.85)', 
      borderRadius: '8px',
      borderLeft: '4px solid #3b82f6',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '13px'
    }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px' }}>🧠</span>
          <strong style={{ color: '#38bdf8', letterSpacing: '0.04em' }}>EXPLAINABLE AI REASONING TRACE</strong>
        </div>
        <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
          {reasoningText}
        </p>
        
        {/* Intelligence Fusion Evidence Panel */}
        {alert.evidence && (alert.evidence.trust_score !== undefined || alert.evidence.intent_score !== undefined || alert.evidence.silence_duration_s !== undefined) && (
          <div style={{ 
            marginTop: '10px',
            padding: '10px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {alert.evidence.silence_duration_s !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>AIS Silence Duration:</span>
                <strong style={{ color: '#f59e0b' }}>
                  {alert.evidence.silence_duration_s} seconds (Tolerance: {alert.reasoning_trace?.thresholds_used?.zone_tolerance_s || 120}s)
                </strong>
              </div>
            )}
            {alert.evidence.boundary_proximity_km !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Zone Proximity:</span>
                <strong style={{ color: '#38bdf8' }}>
                  {alert.evidence.boundary_proximity_km} km to border
                </strong>
              </div>
            )}
            {alert.evidence.trust_score !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Transponder Truth Score:</span>
                <strong style={{ color: alert.evidence.trust_score < 0.5 ? '#ef4444' : '#10b981' }}>
                  {Math.round(alert.evidence.trust_score * 100)}% (Kinematic Anomaly)
                </strong>
              </div>
            )}
            {alert.evidence.intent_score !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Intent Risk Score:</span>
                <strong style={{ color: alert.evidence.intent_score > 0.8 ? '#ef4444' : '#f59e0b' }}>
                  {Math.round(alert.evidence.intent_score * 100)}% (MPA Proximity)
                </strong>
              </div>
            )}
          </div>
        )}

        {alert.evidence?.conflicting_position && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px 10px', 
            backgroundColor: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '11.5px',
            fontWeight: '600'
          }}>
            ⚠️ Telemetry Collision: Conflicting position broadcast at [{alert.evidence.conflicting_position.lat.toFixed(3)}, {alert.evidence.conflicting_position.lon.toFixed(3)}]
          </div>
        )}
      </div>

      <div style={{ marginBottom: '14px', padding: '10px', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: '#94a3b8' }}>Target Sector:</span>
          <span style={{ color: '#f8fafc', fontWeight: '600' }}>{alert.zone || 'Coastal Patrol Sector'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Corroboration:</span>
          <span style={{ 
            color: corroborationStatus === 'corroborated' ? '#4ade80' : '#fbbf24',
            fontWeight: '700',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: corroborationStatus === 'corroborated' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.15)',
            border: corroborationStatus === 'corroborated' ? '1px solid #4ade80' : '1px solid #fbbf24'
          }}>
            {corroborationStatus.toUpperCase()} {corroborationSource ? `[${corroborationSource}]` : ''}
          </span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); exportLeadPackage(alert); }}
        style={{
          width: '100%',
          padding: '10px 14px',
          backgroundColor: '#2563eb',
          border: 'none',
          color: 'white',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '12px',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
        }}
      >
        <span>📥</span> EXPORT INVESTIGATIVE LEAD PACKAGE (JSON)
      </button>
    </div>
  );
}
