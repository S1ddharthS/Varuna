import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { zones } from '../utils/zones';

export default function MapView({ positionsGeoJson, alerts, selectedAlertId }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  useEffect(() => {
    if (map.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [77.5, 9.8],
      zoom: 6.2,
      pitch: 20,
      interactive: true
    });

    if (typeof window !== 'undefined') {
      window.__map = map.current;
    }

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    
    map.current.on('load', () => {
      // 1. Add Maritime Zones GeoJSON
      map.current.addSource('maritime-zones', {
        type: 'geojson',
        data: zones
      });

      // Zones fill layer
      map.current.addLayer({
        id: 'zones-fill-layer',
        type: 'fill',
        source: 'maritime-zones',
        paint: {
          'fill-color': ['get', 'fill_color'],
          'fill-opacity': 0.35
        }
      });

      // Zones boundary line
      map.current.addLayer({
        id: 'zones-outline-layer',
        type: 'line',
        source: 'maritime-zones',
        paint: {
          'line-color': ['get', 'stroke_color'],
          'line-width': 2,
          'line-dasharray': [4, 2]
        }
      });

      // Zones label layer
      map.current.addLayer({
        id: 'zones-labels',
        type: 'symbol',
        source: 'maritime-zones',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['Open Sans Regular'],
          'text-anchor': 'center',
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1
        },
        paint: {
          'text-color': '#e2e8f0',
          'text-halo-color': 'rgba(15, 23, 42, 0.95)',
          'text-halo-width': 2
        }
      });

      // 2. Add Alert Cone / Dotted Projection Line
      map.current.addSource('alert-path', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      
      map.current.addLayer({
        id: 'alert-path-layer',
        type: 'line',
        source: 'alert-path',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'is_conflict'], true], '#ef4444',
            '#f59e0b'
          ],
          'line-width': 3.5,
          'line-dasharray': [3, 2]
        }
      });

      // Alert dead-reckoning cone polygon
      map.current.addSource('alert-cone', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'alert-cone-layer',
        type: 'fill',
        source: 'alert-cone',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.35
        }
      });

      map.current.addLayer({
        id: 'alert-cone-outline',
        type: 'line',
        source: 'alert-cone',
        paint: {
          'line-color': '#fbbf24',
          'line-width': 2,
          'line-dasharray': [3, 2]
        }
      });

      // 3. For identity conflicts, show two red dots
      map.current.addSource('identity-conflict', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      
      map.current.addLayer({
        id: 'identity-conflict-layer',
        type: 'circle',
        source: 'identity-conflict',
        paint: {
          'circle-radius': 12,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // 4. Add Live AIS Vessels Source
      map.current.addSource('vessels', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Vessels Aura / Pulse for low-trust or spoofed vessels
      map.current.addLayer({
        id: 'vessels-pulse-layer',
        type: 'circle',
        source: 'vessels',
        filter: ['<', ['coalesce', ['get', 'trust_score'], 1.0], 0.5],
        paint: {
          'circle-radius': 14,
          'circle-color': '#ef4444',
          'circle-opacity': 0.4
        }
      });
      
      // Vessels core marker
      map.current.addLayer({
        id: 'vessels-layer',
        type: 'circle',
        source: 'vessels',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'case',
            ['<', ['coalesce', ['get', 'trust_score'], 1.0], 0.5], '#ef4444',
            ['<=', ['coalesce', ['get', 'trust_score'], 1.0], 0.8], '#f59e0b',
            '#10b981'
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': [
            'case',
            ['==', ['get', 'is_dark'], true], 0.3,
            1.0
          ]
        }
      });

      // Vessel ID labels
      map.current.addLayer({
        id: 'vessels-labels',
        type: 'symbol',
        source: 'vessels',
        layout: {
          'text-field': ['get', 'vessel_id'],
          'text-size': 10,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular']
        },
        paint: {
          'text-color': '#f8fafc',
          'text-halo-color': 'rgba(15, 23, 42, 0.9)',
          'text-halo-width': 1.5
        }
      });
    });
  }, []);

  // Update vessels on rAF flush
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const source = map.current.getSource('vessels');
    if (source) {
      source.setData(positionsGeoJson);
    }
  }, [positionsGeoJson]);

  // Animate pulse
  useEffect(() => {
    if (!map.current) return;
    let animationId;
    const animateMarker = (timestamp) => {
      if (map.current.isStyleLoaded() && map.current.getLayer('vessels-pulse-layer')) {
        const radius = (Math.sin(timestamp / 250) + 1) * 6 + 10;
        const opacity = (Math.sin(timestamp / 250) + 1) * 0.2 + 0.15;
        map.current.setPaintProperty('vessels-pulse-layer', 'circle-radius', radius);
        map.current.setPaintProperty('vessels-pulse-layer', 'circle-opacity', opacity);
      }
      animationId = requestAnimationFrame(animateMarker);
    };
    animationId = requestAnimationFrame(animateMarker);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  // Update selected alert visualizations
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    const pathSource = map.current.getSource('alert-path');
    const coneSource = map.current.getSource('alert-cone');
    const idSource = map.current.getSource('identity-conflict');
    
    if (!selectedAlertId) {
      if (pathSource) pathSource.setData({ type: 'FeatureCollection', features: [] });
      if (coneSource) coneSource.setData({ type: 'FeatureCollection', features: [] });
      if (idSource) idSource.setData({ type: 'FeatureCollection', features: [] });
      return;
    }
    
    const alert = alerts.find(a => a.alert_id === selectedAlertId);
    if (!alert || !alert.position) return;

    const { lat, lon } = alert.position;
    
    const t = (alert.type || '').toLowerCase();
    
    // Draw dotted path and uncertainty cone for suspected_dark_transit, illegal fishing, or boundary alerts
    if (t.includes('dark') || t.includes('fishing') || t.includes('breach') || t.includes('geofence') || t.includes('loiter')) {
      const headingRad = ((alert.evidence?.heading || 60) * Math.PI) / 180;
      const coneLength = 0.55;
      const spread = 0.35;

      const p1 = [lon, lat];
      const p2 = [lon + Math.sin(headingRad - spread) * coneLength, lat + Math.cos(headingRad - spread) * coneLength];
      const p3 = [lon + Math.sin(headingRad + spread) * coneLength, lat + Math.cos(headingRad + spread) * coneLength];
      const pCenter = [lon + Math.sin(headingRad) * coneLength, lat + Math.cos(headingRad) * coneLength];

      if (pathSource) {
        pathSource.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [p1, pCenter] },
            properties: { label: 'Projected Dead Reckoning' }
          }]
        });
      }

      if (coneSource) {
        coneSource.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[p1, p2, p3, p1]] },
            properties: { label: 'Uncertainty Re-entry Cone' }
          }]
        });
      }

      if (idSource) idSource.setData({ type: 'FeatureCollection', features: [] });

      map.current.jumpTo({ 
        center: [lon, lat], 
        zoom: 9.8, 
        pitch: 45, 
        bearing: -15
      });
    } 
    // Show both positions for identity conflict / spoofing
    else if (t.includes('conflict') || t.includes('fraud') || t.includes('mmsi') || t.includes('spoof')) {
      const features = [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [alert.position.lon, alert.position.lat] },
        properties: { tag: 'Transponder 1' }
      }];
      
      if (alert.evidence?.conflicting_position) {
        features.push({
          type: 'Feature',
          geometry: { 
            type: 'Point', 
            coordinates: [alert.evidence.conflicting_position.lon, alert.evidence.conflicting_position.lat] 
          },
          properties: { tag: 'Transponder 2 (Spoof)' }
        });
      }
      
      if (idSource) idSource.setData({ type: 'FeatureCollection', features });
      if (pathSource) {
        if (alert.evidence?.conflicting_position) {
          pathSource.setData({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [alert.position.lon, alert.position.lat],
                  [alert.evidence.conflicting_position.lon, alert.evidence.conflicting_position.lat]
                ]
              },
              properties: { is_conflict: true }
            }]
          });
        } else {
          pathSource.setData({ type: 'FeatureCollection', features: [] });
        }
      }
      if (coneSource) coneSource.setData({ type: 'FeatureCollection', features: [] });

      // Focus camera between both conflicting vessels in Arabian Sea
      const midLon = alert.evidence?.conflicting_position 
        ? (alert.position.lon + alert.evidence.conflicting_position.lon) / 2 
        : alert.position.lon;
      const midLat = alert.evidence?.conflicting_position 
        ? (alert.position.lat + alert.evidence.conflicting_position.lat) / 2 
        : alert.position.lat;

      map.current.jumpTo({ 
        center: [midLon, midLat], 
        zoom: 7.6, 
        pitch: 35, 
        bearing: 25
      });
    } else {
      if (pathSource) pathSource.setData({ type: 'FeatureCollection', features: [] });
      if (coneSource) coneSource.setData({ type: 'FeatureCollection', features: [] });
      if (idSource) idSource.setData({ type: 'FeatureCollection', features: [] });
      
      // Default reset view
      map.current.jumpTo({ 
        center: [77.5, 9.8], 
        zoom: 5.6, 
        pitch: 0, 
        bearing: 0
      });
    }
  }, [selectedAlertId, alerts]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  );
}
