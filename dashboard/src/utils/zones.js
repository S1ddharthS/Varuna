export const zones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { 
        name: "Gulf of Mannar MPA", 
        zone_type: "coastal",
        fill_color: "rgba(239, 68, 68, 0.25)", 
        stroke_color: "#ef4444",
        silence_tolerance: "120s"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[78.0, 8.5], [79.5, 8.5], [79.5, 9.5], [78.0, 9.5], [78.0, 8.5]]] 
      }
    },
    {
      type: "Feature",
      properties: { 
        name: "Palk Bay Restricted Zone", 
        zone_type: "coastal",
        fill_color: "rgba(245, 158, 11, 0.22)", 
        stroke_color: "#f59e0b",
        silence_tolerance: "120s"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[79.0, 9.5], [80.0, 9.5], [80.0, 10.5], [79.0, 10.5], [79.0, 9.5]]] 
      }
    },
    {
      type: "Feature",
      properties: { 
        name: "Lakshadweep Islands EEZ", 
        zone_type: "offshore",
        fill_color: "rgba(59, 130, 246, 0.2)", 
        stroke_color: "#3b82f6",
        silence_tolerance: "45min"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[71.0, 10.0], [74.0, 10.0], [74.0, 12.5], [71.0, 12.5], [71.0, 10.0]]] 
      }
    },
    {
      type: "Feature",
      properties: { 
        name: "Kochi Port Anchorage Zone", 
        zone_type: "coastal",
        fill_color: "rgba(16, 185, 129, 0.25)", 
        stroke_color: "#10b981",
        silence_tolerance: "120s"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[75.8, 9.8], [76.4, 9.8], [76.4, 10.2], [75.8, 10.2], [75.8, 9.8]]] 
      }
    },
    {
      type: "Feature",
      properties: { 
        name: "Sri Lanka Northern EEZ Boundary", 
        zone_type: "offshore",
        fill_color: "rgba(168, 85, 247, 0.2)", 
        stroke_color: "#a855f7",
        silence_tolerance: "45min"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[79.5, 8.0], [82.0, 8.0], [82.0, 10.0], [79.5, 10.0], [79.5, 8.0]]] 
      }
    },
    {
      type: "Feature",
      properties: { 
        name: "Arabian Sea Deep Water Zone", 
        zone_type: "open_ocean",
        fill_color: "rgba(99, 102, 241, 0.15)", 
        stroke_color: "#6366f1",
        silence_tolerance: "6hr"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[65.0, 8.0], [72.0, 8.0], [72.0, 15.0], [65.0, 15.0], [65.0, 8.0]]] 
      }
    },
    {
      type: "Feature",
      properties: { 
        name: "Andaman North Marine Reserve", 
        zone_type: "offshore",
        fill_color: "rgba(236, 72, 153, 0.2)", 
        stroke_color: "#ec4899",
        silence_tolerance: "45min"
      },
      geometry: { 
        type: "Polygon", 
        coordinates: [[[92.0, 12.0], [94.0, 12.0], [94.0, 14.0], [92.0, 14.0], [92.0, 12.0]]] 
      }
    }
  ]
};
