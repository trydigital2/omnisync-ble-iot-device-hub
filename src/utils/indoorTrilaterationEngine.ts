export interface AnchorBeacon {
  beaconId: string;
  name: string;
  xMeters: number; // 2D floor coordinates
  yMeters: number;
  measuredRssiDbm: number;
  txPower0mMilliWatts: number;
}

export interface TrilaterationResult {
  estimatedX: number;
  estimatedY: number;
  accuracyRadiusMeters: number;
  activeAnchorsCount: number;
  residualErrorMeters: number;
  confidenceTier: 'HIGH_PRECISION' | 'DEGRADED_MULTI_PATH' | 'UNRELIABLE';
}

/**
 * Computes 2D position (x, y) via 3-point weighted centroid trilateration from RSSI beacon anchors.
 * d = 10 ^ ((TxPower - RSSI) / (10 * n)) where n = 2.2
 */
export function calculateIndoorCentroid(anchors: AnchorBeacon[]): TrilaterationResult {
  if (anchors.length < 3) {
    return {
      estimatedX: 0,
      estimatedY: 0,
      accuracyRadiusMeters: 99.9,
      activeAnchorsCount: anchors.length,
      residualErrorMeters: 0,
      confidenceTier: 'UNRELIABLE',
    };
  }

  // Convert RSSI to distance
  const pathLossN = 2.2;
  const distances = anchors.map((a) => {
    const ratio = (a.txPower0mMilliWatts - a.measuredRssiDbm) / (10 * pathLossN);
    return Math.max(0.2, Math.pow(10, ratio));
  });

  // Inverse distance weighting (w_i = 1 / d_i^2)
  let sumWeight = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let i = 0; i < anchors.length; i++) {
    const w = 1 / Math.pow(distances[i], 2);
    sumWeight += w;
    weightedX += anchors[i].xMeters * w;
    weightedY += anchors[i].yMeters * w;
  }

  const estimatedX = Math.round((weightedX / sumWeight) * 100) / 100;
  const estimatedY = Math.round((weightedY / sumWeight) * 100) / 100;

  // Residual error
  let residualSum = 0;
  for (let i = 0; i < anchors.length; i++) {
    const dx = estimatedX - anchors[i].xMeters;
    const dy = estimatedY - anchors[i].yMeters;
    const distCalc = Math.sqrt(dx * dx + dy * dy);
    residualSum += Math.abs(distCalc - distances[i]);
  }
  const residualErrorMeters = Math.round((residualSum / anchors.length) * 100) / 100;
  const accuracyRadiusMeters = Math.max(0.6, residualErrorMeters);

  let confidenceTier: 'HIGH_PRECISION' | 'DEGRADED_MULTI_PATH' | 'UNRELIABLE' = 'HIGH_PRECISION';
  if (accuracyRadiusMeters > 2.5) {
    confidenceTier = 'DEGRADED_MULTI_PATH';
  }

  return {
    estimatedX,
    estimatedY,
    accuracyRadiusMeters,
    activeAnchorsCount: anchors.length,
    residualErrorMeters,
    confidenceTier,
  };
}

export function getSampleIndoorAnchors(): AnchorBeacon[] {
  return [
    { beaconId: 'ANC-NORDIC-01', name: 'West Gate Anchor (A1)', xMeters: 0.0, yMeters: 0.0, measuredRssiDbm: -61, txPower0mMilliWatts: -59 },
    { beaconId: 'ANC-NORDIC-02', name: 'East Wall Anchor (A2)', xMeters: 12.0, yMeters: 0.0, measuredRssiDbm: -68, txPower0mMilliWatts: -59 },
    { beaconId: 'ANC-NORDIC-03', name: 'North Apex Anchor (A3)', xMeters: 6.0, yMeters: 10.0, measuredRssiDbm: -64, txPower0mMilliWatts: -59 },
  ];
}
