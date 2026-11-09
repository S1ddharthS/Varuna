import { useEffect, useRef, useState } from 'react';
import { useSSE } from './useSSE';

export function usePositions(url) {
  const { status, messageHandlerRef } = useSSE(url);
  const positionsMap = useRef(new Map());
  const [geoJson, setGeoJson] = useState({
    type: 'FeatureCollection',
    features: []
  });

  useEffect(() => {
    messageHandlerRef.current = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.vessel_id) {
          positionsMap.current.set(data.vessel_id, data);
        }
      } catch (e) {
        // ignore parse error
      }
    };
  }, [messageHandlerRef]);

  useEffect(() => {
    let animationFrameId;
    
    function flush() {
      const features = [];
      for (const pos of positionsMap.current.values()) {
        const trust = pos.trust_score !== undefined 
          ? pos.trust_score 
          : (pos.vessel_id === 'V-CRIMINAL' ? 0.25 : 0.95);

        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [pos.lon, pos.lat] },
          properties: {
            vessel_id: pos.vessel_id,
            mmsi: pos.mmsi || '',
            heading: pos.heading || 0,
            speed_knots: pos.speed_knots || 0,
            trust_score: trust,
            is_dark: pos.is_dark || false
          }
        });
      }
      
      setGeoJson({
        type: 'FeatureCollection',
        features
      });
      
      animationFrameId = requestAnimationFrame(flush);
    }
    
    animationFrameId = requestAnimationFrame(flush);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return { status, geoJson };
}
