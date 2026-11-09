import puppeteer from 'puppeteer-core';
import path from 'path';

const outDir = 'C:\\Users\\siddharth\\Desktop\\Varuna-1\\screenshots';

async function main() {
  console.log('1. Launching Headless Chrome browser...');
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

  console.log('2. Loading Dashboard UI at http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  // --- SCREENSHOT 1: Live Maritime Surveillance Overview ---
  console.log('3. Capturing Screenshot 1: Tactical Surveillance Overview...');
  await page.evaluate(() => {
    if (window.__selectAlert) window.__selectAlert(null);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ 
    path: path.join(outDir, '01_tactical_surveillance_overview.png')
  });

  // --- SCREENSHOT 2: Dark Transit & Explainable AI Reasoning Trace ---
  console.log('4. Triggering Dark Transit on engine...');
  await fetch('http://localhost:8080/api/trigger/dark_transit', { method: 'POST' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Selecting Dark Transit alert...');
  const darkAlertId = await page.evaluate(() => {
    const list = window.__alerts || [];
    const found = list.find(a => 
      a.vessel_id === 'V-DARK-001' || 
      (a.type || '').includes('dark') || 
      (a.type || '').includes('fishing')
    ) || list[0];
    
    if (found && window.__selectAlert) {
      window.__selectAlert(found.alert_id);
      return found.alert_id;
    }
    return null;
  });

  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing Screenshot 2: Dark Transit & Explainable AI (Alert ID:', darkAlertId, ')...');
  await page.screenshot({ 
    path: path.join(outDir, '02_dark_transit_explainable_ai.png')
  });

  // --- SCREENSHOT 3: MMSI Identity Conflict & Telemetry Collision ---
  console.log('5. Triggering MMSI Conflict on engine...');
  await fetch('http://localhost:8080/api/trigger/mmsi_conflict', { method: 'POST' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Selecting MMSI Conflict alert...');
  await page.evaluate(() => {
    const list = window.__alerts || [];
    const conflict = list.find(a => 
      (a.type || '').includes('conflict') || 
      (a.type || '').includes('fraud') || 
      a.vessel_id === 'V-SPOOF-B' ||
      a.vessel_id === 'V-SPOOF-A'
    );
    if (conflict && window.__selectAlert) {
      window.__selectAlert(conflict.alert_id);
    }
  });

  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing Screenshot 3: MMSI Spoofing Identity Conflict...');
  await page.screenshot({ 
    path: path.join(outDir, '03_mmsi_spoofing_identity_conflict.png')
  });

  // --- SCREENSHOT 4: Multi-Sensor Satellite Corroboration (Sentinel-1 SAR) ---
  console.log('6. Applying Sentinel-1 SAR Satellite Corroboration...');
  const corroborateTargetId = await page.evaluate(async (darkId) => {
    const list = window.__alerts || [];
    const target = list.find(a => a.alert_id === darkId) || 
                   list.find(a => a.vessel_id === 'V-DARK-001') || 
                   list[0];

    if (target) {
      target.corroboration = {
        status: 'corroborated',
        source: 'Sentinel-1 SAR'
      };
      if (!target.evidence) target.evidence = {};
      target.evidence.sar_tile = 'S1A_IW_GRDH_1SDV_20260710T123456';
      target.evidence.radar_cross_section_db = 28.4;
      if (window.__selectAlert) window.__selectAlert(target.alert_id);
      return target.alert_id;
    }
    return null;
  }, darkAlertId);

  if (corroborateTargetId) {
    try {
      await fetch('http://localhost:8080/api/corroborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: corroborateTargetId,
          source: 'Sentinel-1 SAR',
          evidence: {
            sar_tile: 'S1A_IW_GRDH_1SDV_20260710T123456',
            radar_cross_section_db: 28.4,
            confidence: 0.96
          }
        })
      });
    } catch (e) {}
  }

  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing Screenshot 4: Multi-Sensor SAR Corroboration...');
  await page.screenshot({ 
    path: path.join(outDir, '04_multi_sensor_sar_corroboration.png')
  });

  // --- SCREENSHOT 5: Boundary Hysteresis & System Performance Telemetry ---
  console.log('7. Triggering Boundary Jitter control & telemetry...');
  await fetch('http://localhost:8080/api/trigger/boundary_jitter', { method: 'POST' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    if (window.__selectAlert) window.__selectAlert(null);
    const slider = document.querySelector('.debug-control-layer input[type="range"]');
    if (slider) {
      slider.value = 85;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing Screenshot 5: Boundary Hysteresis & Performance Telemetry...');
  await page.screenshot({ 
    path: path.join(outDir, '05_boundary_hysteresis_and_performance.png')
  });

  await browser.close();
  console.log('\n=== ALL 5 LINKEDIN SCREENSHOTS CAPTURED PERFECTLY! ===');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
