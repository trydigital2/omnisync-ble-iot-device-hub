export type ProximityZone = 'IMMEDIATE' | 'NEAR' | 'FAR' | 'PERIMETER' | 'OUT_OF_RANGE';

export interface BleRadarTarget {
  id: string;
  name: string;
  macAddress: string;
  rssi: number;
  txPower: number;
  estimatedDistanceMeters: number;
  polarAngleDeg: number;
  cartesianXPercent: number; // -100 to 100 relative to radar center
  cartesianYPercent: number; // -100 to 100 relative to radar center
  proximityZone: ProximityZone;
  isDegradedSignal: boolean;
  packetLossRate: number;
  lastSeenMsAgo: number;
}

export interface RadarSweepMetrics {
  totalNodesDetected: number;
  activeCount: number;
  degradedCount: number;
  closestNodeDistanceMeters: number;
  averageRssi: number;
  radarRadiusMeters: number;
}

/**
 * Calculates distance from RSSI using standard Log-Distance Path Loss Model:
 * d = 10 ^ ((TxPower - RSSI) / (10 * pathLossExponent))
 */
export function calculateLogDistanceMeters(
  rssi: number,
  txPower: number = -59,
  pathLossExponent: number = 2.2
): number {
  if (rssi === 0) return 0;
  const ratio = (txPower - rssi) / (10 * pathLossExponent);
  const distance = Math.pow(10, ratio);
  return parseFloat(distance.toFixed(2));
}

/**
 * Determines proximity zone band based on distance in meters.
 */
export function getProximityZone(distanceMeters: number): ProximityZone {
  if (distanceMeters <= 1.0) return 'IMMEDIATE';
  if (distanceMeters <= 3.0) return 'NEAR';
  if (distanceMeters <= 5.0) return 'FAR';
  if (distanceMeters <= 10.0) return 'PERIMETER';
  return 'OUT_OF_RANGE';
}

/**
 * Hashes MAC address to a stable polar bearing angle between 0 and 359 degrees.
 */
export function calculatePolarAngleFromMac(macAddress: string): number {
  const clean = macAddress.replace(/[^a-fA-F0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

/**
 * Converts polar coordinates (distance, angleDeg) to normalized Cartesian percent coordinates (-100 to +100)
 * clamped within the radar circular perimeter (maxRadiusMeters = 10m).
 */
export function polarToCartesianPercent(
  distanceMeters: number,
  angleDeg: number,
  maxRadarRadiusMeters: number = 10.0
): { xPercent: number; yPercent: number } {
  // Normalize radial distance clamped between 0 and 1.0
  const normalizedRadius = Math.min(Math.max(distanceMeters / maxRadarRadiusMeters, 0.08), 0.94);
  const angleRad = (angleDeg - 90) * (Math.PI / 180); // 0 deg points North

  const xPercent = parseFloat((normalizedRadius * Math.cos(angleRad) * 100).toFixed(2));
  const yPercent = parseFloat((normalizedRadius * Math.sin(angleRad) * 100).toFixed(2));

  return { xPercent, yPercent };
}

/**
 * Generates initial telemetry target dataset for radar visualization.
 */
export function getSimulatedRadarTargets(): BleRadarTarget[] {
  const rawNodes = [
    {
      id: 'node-1',
      name: 'Nordic nRF52 Sensor Beacon',
      macAddress: 'DC:A6:32:8B:11:04',
      rssi: -52,
      txPower: -59,
      lastSeenMsAgo: 45,
      packetLossRate: 0.02,
    },
    {
      id: 'node-2',
      name: 'ESP32 Smart Gateway Hub',
      macAddress: '24:6F:28:CE:50:9A',
      rssi: -68,
      txPower: -59,
      lastSeenMsAgo: 120,
      packetLossRate: 0.04,
    },
    {
      id: 'node-3',
      name: 'Industrial BLE Thermocouple',
      macAddress: 'E4:5F:01:42:C8:17',
      rssi: -88,
      txPower: -65,
      lastSeenMsAgo: 410,
      packetLossRate: 0.18,
    },
    {
      id: 'node-4',
      name: 'Medical Pulse Oximeter Tag',
      macAddress: '3C:71:BF:02:88:51',
      rssi: -74,
      txPower: -59,
      lastSeenMsAgo: 95,
      packetLossRate: 0.06,
    },
    {
      id: 'node-5',
      name: 'Ultra-low Power Asset Tracker',
      macAddress: 'AC:67:B2:19:E3:44',
      rssi: -92,
      txPower: -65,
      lastSeenMsAgo: 860,
      packetLossRate: 0.25,
    },
  ];

  return rawNodes.map((node) => {
    const distance = calculateLogDistanceMeters(node.rssi, node.txPower);
    const angleDeg = calculatePolarAngleFromMac(node.macAddress);
    const { xPercent, yPercent } = polarToCartesianPercent(distance, angleDeg);
    const zone = getProximityZone(distance);
    const isDegraded = node.rssi < -85 || node.packetLossRate > 0.15;

    return {
      id: node.id,
      name: node.name,
      macAddress: node.macAddress,
      rssi: node.rssi,
      txPower: node.txPower,
      estimatedDistanceMeters: distance,
      polarAngleDeg: angleDeg,
      cartesianXPercent: xPercent,
      cartesianYPercent: yPercent,
      proximityZone: zone,
      isDegradedSignal: isDegraded,
      packetLossRate: node.packetLossRate,
      lastSeenMsAgo: node.lastSeenMsAgo,
    };
  });
}

/**
 * Computes aggregate summary metrics for radar perimeter display.
 */
export function computeRadarSweepMetrics(targets: BleRadarTarget[]): RadarSweepMetrics {
  if (targets.length === 0) {
    return {
      totalNodesDetected: 0,
      activeCount: 0,
      degradedCount: 0,
      closestNodeDistanceMeters: 0,
      averageRssi: -100,
      radarRadiusMeters: 10,
    };
  }

  const degradedCount = targets.filter((t) => t.isDegradedSignal).length;
  const activeCount = targets.length - degradedCount;
  const closest = Math.min(...targets.map((t) => t.estimatedDistanceMeters));
  const avgRssi = Math.round(targets.reduce((acc, t) => acc + t.rssi, 0) / targets.length);

  return {
    totalNodesDetected: targets.length,
    activeCount,
    degradedCount,
    closestNodeDistanceMeters: closest,
    averageRssi: avgRssi,
    radarRadiusMeters: 10,
  };
}
