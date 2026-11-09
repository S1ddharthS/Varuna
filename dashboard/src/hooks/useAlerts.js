import { useState, useEffect } from 'react';
import { useSSE } from './useSSE';

export function useAlerts(url) {
  const { status, messageHandlerRef } = useSSE(url);
  const [alerts, setAlerts] = useState([]);
  const [droppedCount, setDroppedCount] = useState(0);

  useEffect(() => {
    messageHandlerRef.current = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'alerts_dropped') {
          setDroppedCount(prev => prev + data.count);
          return;
        }
        
        setAlerts(prev => {
          const existingIdx = prev.findIndex(a => a.alert_id === data.alert_id);
          if (existingIdx >= 0) {
            const next = [...prev];
            next[existingIdx] = { ...next[existingIdx], ...data };
            return next;
          }
          const next = [data, ...prev];
          if (next.length > 100) next.length = 100;
          return next;
        });
      } catch (err) {
        // ignore parse error
      }
    };
  }, [messageHandlerRef]);

  return { status, alerts, droppedCount };
}
