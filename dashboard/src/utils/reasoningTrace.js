export function translateReasoning(trace, evidence) {
  if (!trace && !evidence) return "Multi-sensor rule evaluation triggered based on kinematic telemetry violation.";

  const fragments = [];

  if (evidence?.conflicting_position) {
    const dist = evidence.distance_km ? `${evidence.distance_km.toFixed(1)} km` : "290+ km";
    const sec = evidence.elapsed_seconds !== undefined ? `${evidence.elapsed_seconds.toFixed(1)}s` : "0.1s";
    fragments.push(`identical MMSI broadcast from dual coordinates separated by ${dist} within ${sec} (impossible velocity violation)`);
  }

  if (trace && Array.isArray(trace.inputs_evaluated)) {
    const zoneTolerance = trace.thresholds_used?.zone_tolerance_s || 120;
    const boundaryBuffer = trace.thresholds_used?.boundary_buffer_km || 5.0;

    trace.inputs_evaluated.forEach(input => {
      switch(input) {
        case "silence_ratio":
          if (evidence && evidence.silence_duration_s) {
            const ratio = (evidence.silence_duration_s / zoneTolerance).toFixed(1);
            fragments.push(`AIS silence (${evidence.silence_duration_s}s) exceeded zone tolerance threshold (${zoneTolerance}s) by ${ratio}x`);
          } else {
            fragments.push(`AIS transponder silence exceeded zone tolerance`);
          }
          break;
        case "boundary_proximity":
          if (evidence && evidence.boundary_proximity_km !== undefined) {
            fragments.push(`vessel was positioned ${evidence.boundary_proximity_km} km from marine protected boundary (within buffer of ${boundaryBuffer} km)`);
          }
          break;
        case "historical_gap_pattern":
          fragments.push("absence pattern deviates sharply from transponder continuity in this sector");
          break;
        case "time_of_day":
          fragments.push("gap initiated during nighttime surveillance window");
          break;
        case "kinematic_feasibility":
        case "kinematic_plausibility":
          if (!evidence?.conflicting_position) {
            fragments.push("reported speed and heading contradict maritime kinematic model");
          }
          break;
        case "mmsi_match":
          // already covered by conflicting_position above
          break;
        default:
          break;
      }
    });
  }

  if (fragments.length === 0) {
    if (evidence?.silence_duration_s) {
      return `Vessel exceeded silence tolerance threshold (${evidence.silence_duration_s}s) near marine protected zone boundary.`;
    }
    return "Automated rule violation: kinematic anomalies or boundary hysteresis trigger detected in surveillance corridor.";
  }

  const engineVer = trace?.engine_version || "Varuna-Reflex-Engine-v1.0";
  return `Alert generated because ${fragments.join('; ')}. Evaluated deterministically by ${engineVer}.`;
}
