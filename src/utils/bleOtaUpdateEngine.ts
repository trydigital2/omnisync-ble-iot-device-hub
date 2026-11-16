export type OtaTransferState =
  | 'IDLE'
  | 'BOOTLOADER_INIT'
  | 'MANIFEST_VERIFIED'
  | 'STREAMING_CHUNKS'
  | 'CRC_VALIDATING'
  | 'REBOOTING_DEVICE'
  | 'UPDATE_SUCCESS'
  | 'TRANSFER_FAILED';

export interface FirmwareManifest {
  targetDeviceId: string;
  hardwareRevision: string;
  currentFirmwareVersion: string;
  targetFirmwareVersion: string;
  imageSizeBytes: number;
  crc32Checksum: string;
  releaseNotes: string[];
}

export interface OtaProgressStats {
  state: OtaTransferState;
  chunksTransferred: number;
  totalChunks: number;
  bytesTransferred: number;
  totalBytes: number;
  progressPercent: number;
  transferRateKbs: number;
  estimatedRemainingSec: number;
}

/**
 * Calculates BLE chunk fragmentation based on negotiated ATT MTU size.
 * Standard BLE 5.0 ATT MTU = 247 bytes (3 bytes ATT header + 244 bytes payload).
 */
export function calculateOtaChunks(
  totalBytes: number,
  mtuPayloadSize: number = 244
): { totalChunks: number; payloadSize: number; lastChunkRemainder: number } {
  const safeTotal = Math.max(1, totalBytes);
  const payloadSize = Math.max(20, mtuPayloadSize);
  const totalChunks = Math.ceil(safeTotal / payloadSize);
  const lastChunkRemainder = safeTotal % payloadSize === 0 ? payloadSize : safeTotal % payloadSize;

  return {
    totalChunks,
    payloadSize,
    lastChunkRemainder,
  };
}

/**
 * Simple polynomial CRC-32 checksum calculation simulation for telemetry integrity verification.
 */
export function calculateCrc32Checksum(content: string): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < content.length; i++) {
    crc = (crc >>> 8) ^ ((crc ^ content.charCodeAt(i)) & 0xff);
  }
  crc = (crc ^ -1) >>> 0;
  return '0x' + crc.toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Computes live streaming transfer speed and remaining ETA.
 */
export function computeOtaStreamingMetrics(
  bytesTransferred: number,
  totalBytes: number,
  elapsedSeconds: number
): { progressPercent: number; transferRateKbs: number; etaSeconds: number } {
  if (totalBytes <= 0) {
    return { progressPercent: 0, transferRateKbs: 0, etaSeconds: 0 };
  }

  const progressPercent = Math.min(100, Math.round((bytesTransferred / totalBytes) * 100));
  const safeElapsed = Math.max(0.1, elapsedSeconds);
  const transferRateKbs = Math.round((bytesTransferred / 1024 / safeElapsed) * 10) / 10;
  
  const remainingBytes = Math.max(0, totalBytes - bytesTransferred);
  const rateBytesPerSec = (bytesTransferred / safeElapsed);
  const etaSeconds = rateBytesPerSec > 0 ? Math.ceil(remainingBytes / rateBytesPerSec) : 0;

  return {
    progressPercent,
    transferRateKbs,
    etaSeconds,
  };
}

/**
 * Returns mock firmware update package for IoT sensors.
 */
export function getSampleFirmwareManifest(): FirmwareManifest {
  return {
    targetDeviceId: 'A4:C1:38:F2:99:12',
    hardwareRevision: 'REV-B4-NRF52840',
    currentFirmwareVersion: 'v2.4.1',
    targetFirmwareVersion: 'v2.5.0-PROD',
    imageSizeBytes: 312840, // ~305 KB
    crc32Checksum: '0x8B3E41F9',
    releaseNotes: [
      'Reduced BLE sleep current consumption by 18%',
      'Extended TX power range to +8 dBm for industrial mesh nodes',
      'Fixed GATT disconnection timeout during long sync sweeps',
    ],
  };
}
