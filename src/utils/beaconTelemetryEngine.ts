export type BeaconFrameType = 'EDDYSTONE_UID' | 'EDDYSTONE_URL' | 'EDDYSTONE_TLM' | 'IBEACON';

export type ProximityZone = 'IMMEDIATE' | 'NEAR' | 'FAR' | 'OUT_OF_RANGE';

export interface EddystoneUidData {
  namespaceId: string; // 10-byte hex (e.g. 0xEDD1FEED010203040506)
  instanceId: string; // 6-byte hex
  txPower0m: number; // calibrated RSSI at 0 meters
}

export interface EddystoneTlmData {
  version: number;
  batteryVoltageMv: number;
  beaconTemperatureC: number;
  advertisingPduCount: number;
  uptimeSeconds: number;
}

export interface BeaconDeviceRecord {
  beaconId: string;
  name: string;
  macAddress: string;
  frameType: BeaconFrameType;
  currentRssiDbm: number;
  uid?: EddystoneUidData;
  tlm?: EddystoneTlmData;
  lastPacketTimestampIso: string;
}

/**
 * Calculates estimated distance using log-distance path loss formula for beacon advertising:
 * RSSI = TxPower - 10 * n * log10(d)  where n = 2.4 (indoor attenuation factor)
 */
export function estimateBeaconDistance(
  currentRssiDbm: number,
  txPower0m: number = -59
): { distanceMeters: number; zone: ProximityZone } {
  if (currentRssiDbm >= 0) {
    return { distanceMeters: 0.1, zone: 'IMMEDIATE' };
  }

  const pathLossExponent = 2.4;
  const ratio = (txPower0m - currentRssiDbm) / (10 * pathLossExponent);
  const rawDistance = Math.pow(10, ratio);
  const distanceMeters = Math.round(rawDistance * 100) / 100;

  let zone: ProximityZone;
  if (distanceMeters < 0.5) {
    zone = 'IMMEDIATE';
  } else if (distanceMeters < 3.0) {
    zone = 'NEAR';
  } else if (distanceMeters < 15.0) {
    zone = 'FAR';
  } else {
    zone = 'OUT_OF_RANGE';
  }

  return { distanceMeters, zone };
}

/**
 * Formats uptime seconds into human-readable duration (e.g. 14d 6h 32m).
 */
export function formatBeaconUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Returns mock sample beacons streaming Eddystone packets.
 */
export function getSampleBeaconTelemetry(): BeaconDeviceRecord[] {
  return [
    {
      beaconId: 'BCN-WAREHOUSE-01',
      name: 'OmniBeacon Nordic NRF52',
      macAddress: 'DC:A6:32:78:E1:90',
      frameType: 'EDDYSTONE_TLM',
      currentRssiDbm: -63,
      uid: {
        namespaceId: 'EDD1FEED9921',
        instanceId: '4488A011',
        txPower0m: -59,
      },
      tlm: {
        version: 0,
        batteryVoltageMv: 3040, // 3.04V coin cell
        beaconTemperatureC: 23.4,
        advertisingPduCount: 1489200,
        uptimeSeconds: 86400 * 12 + 3600 * 4, // 12 days 4 hours
      },
      lastPacketTimestampIso: '2026-11-17T05:28:10Z',
    },
  ];
}
