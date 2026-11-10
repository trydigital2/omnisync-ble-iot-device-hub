export type BleConnectionState = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED';

export interface BleDeviceMetrics {
  id: string;
  name: string;
  rssiDbm: number;
  txPowerLevelDbm: number;
  distanceEstimateMeters: number;
  signalQualityPercent: number;
  signalTier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'CRITICAL';
  batteryPercent: number;
  packetRatePerSec: number;
  connectionState: BleConnectionState;
}

/**
 * Calculates log-distance path loss distance estimate in meters.
 * formula: Distance = 10 ^ ((Measured Power - RSSI) / (10 * Path Loss Exponent))
 */
export function estimateDistanceMeters(
  rssiDbm: number,
  txPowerDbm: number = -59,
  pathLossExponent: number = 2.4
): number {
  if (rssiDbm === 0) return -1.0;
  const ratio = (txPowerDbm - rssiDbm) / (10 * pathLossExponent);
  const distance = Math.pow(10, ratio);
  return Math.round(distance * 10) / 10;
}

/**
 * Converts RSSI dBm to a standardized 0-100% signal quality score.
 */
export function calculateSignalQuality(rssiDbm: number): {
  percent: number;
  tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'CRITICAL';
} {
  // Typical BLE range: -100 dBm (min) to -40 dBm (max)
  const clamped = Math.max(-100, Math.min(-40, rssiDbm));
  const percent = Math.round(((clamped - -100) / (-40 - -100)) * 100);

  let tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'CRITICAL' = 'FAIR';
  if (percent >= 80) tier = 'EXCELLENT';
  else if (percent >= 60) tier = 'GOOD';
  else if (percent >= 40) tier = 'FAIR';
  else if (percent >= 20) tier = 'WEAK';
  else tier = 'CRITICAL';

  return { percent, tier };
}

/**
 * Evaluates comprehensive telemetry metrics for a BLE peripheral.
 */
export function evaluateDeviceMetrics(
  id: string,
  name: string,
  rssiDbm: number,
  batteryPercent: number = 88,
  connectionState: BleConnectionState = 'CONNECTED'
): BleDeviceMetrics {
  const distanceEstimateMeters = estimateDistanceMeters(rssiDbm);
  const { percent: signalQualityPercent, tier: signalTier } = calculateSignalQuality(rssiDbm);
  const packetRatePerSec = connectionState === 'CONNECTED' ? 24 : 0;

  return {
    id,
    name,
    rssiDbm,
    txPowerLevelDbm: -59,
    distanceEstimateMeters,
    signalQualityPercent,
    signalTier,
    batteryPercent,
    packetRatePerSec,
    connectionState,
  };
}
