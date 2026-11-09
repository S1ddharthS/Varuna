import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\siddharth\\Desktop\\Varuna-1\\screenshots';

async function main() {
  console.log('1. Launching Headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=default',
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log('2. Loading Dashboard...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Seed baseline alerts for populated incident feed
  await fetch('http://localhost:8080/api/trigger/loiter', { method: 'POST' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // =========================================================================
  // VIEW 1: REGIONAL MACRO SURVEILLANCE THEATER (MACRO VIEW)
  // Wide regional tactical map showing all 8 sectors, live fleet, telemetry
  // =========================================================================
  console.log('3. Capturing View 1: Regional Macro Surveillance Overview...');
  await page.evaluate(() => {
    if (window.__selectAlert) window.__selectAlert(null);
    if (window.__map) {
      window.__map.jumpTo({ center: [78.0, 10.2], zoom: 5.8, pitch: 0, bearing: 0 });
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ 
    path: path.join(outDir, '01_regional_surveillance_overview.png')
  });

  // =========================================================================
  // VIEW 2: TACTICAL CLOSE-UP INTERCEPTION & UNCERTAINTY CONE (MICRO VIEW)
  // Camera zoomed right in on Gulf of Mannar (zoom 9.8, pitch 48)
  // Shows coastlines, MPA border, vessel dot, and amber uncertainty cone
  // =========================================================================
  console.log('4. Triggering & focusing on Dark Transit Violation...');
  await fetch('http://localhost:8080/api/trigger/dark_transit', { method: 'POST' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const list = window.__alerts || [];
    const target = list.find(a => 
      a.vessel_id === 'V-DARK-001' || 
      (a.type || '').includes('dark') || 
      (a.type || '').includes('fishing')
    ) || list[0];

    if (target) {
      target.corroboration = {
        status: 'corroborated',
        source: 'Sentinel-1 SAR'
      };
      if (!target.evidence) target.evidence = {};
      target.evidence.heading = 60;
      target.evidence.silence_duration_s = 155;
      target.evidence.boundary_proximity_km = 1.2;
      target.evidence.trust_score = 0.05;
      target.evidence.intent_score = 0.95;
      target.zone = 'Gulf of Mannar MPA';
      if (window.__selectAlert) window.__selectAlert(target.alert_id);
    }

    if (window.__map) {
      // Direct high-precision tactical zoom into Gulf of Mannar MPA boundary
      window.__map.jumpTo({ center: [78.2, 8.8], zoom: 9.8, pitch: 48, bearing: -18 });
    }
  });

  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing View 2: Tactical Interception & Explainable AI (Close-Up)...');
  await page.screenshot({ 
    path: path.join(outDir, '02_tactical_interception_dark_fleet.png')
  });

  // =========================================================================
  // VIEW 3: DUAL-TRANSPONDER SPOOFING & TELEMETRY COLLISION (ANOMALY VIEW)
  // Camera pivots to Arabian Sea corridor (zoom 7.4, pitch 35)
  // Shows two red conflicting transponders with red collision vector
  // =========================================================================
  console.log('5. Triggering & focusing on MMSI Identity Fraud Collision...');
  await fetch('http://localhost:8080/api/trigger/mmsi_conflict', { method: 'POST' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const list = window.__alerts || [];
    const conflict = list.find(a => 
      (a.type || '').includes('conflict') || 
      (a.type || '').includes('fraud') || 
      a.vessel_id === 'V-SPOOF-B' ||
      a.vessel_id === 'V-SPOOF-A'
    );

    if (conflict) {
      if (!conflict.evidence) conflict.evidence = {};
      conflict.evidence.conflicting_position = { lat: 10.0, lon: 72.0 };
      conflict.evidence.distance_km = 311.6;
      conflict.evidence.elapsed_seconds = 0.1;
      conflict.zone = 'Arabian Sea Corridor';
      if (window.__selectAlert) window.__selectAlert(conflict.alert_id);
    }

    if (window.__map) {
      // Focus directly between the two spoofed points in Arabian Sea
      window.__map.jumpTo({ center: [73.0, 11.0], zoom: 7.4, pitch: 35, bearing: 22 });
    }
  });

  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing View 3: MMSI Telemetry Collision Fraud...');
  await page.screenshot({ 
    path: path.join(outDir, '03_mmsi_telemetry_collision_fraud.png')
  });

  await browser.close();
  console.log('\n=== SUCCESS: 3 Distinct Showcase Screenshots Generated! ===');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
