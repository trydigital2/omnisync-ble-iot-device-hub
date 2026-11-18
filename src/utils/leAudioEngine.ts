export type AudioCodecType = 'LC3_STANDARD' | 'LC3_PLUS_HIGH_RES' | 'SBC_LEGACY';
export type StreamTopology = 'BROADCAST_ISOCHRONOUS_STREAM' | 'CONNECTED_ISOCHRONOUS_STREAM';

export interface AuracastSourceAnnouncement {
  broadcastId: string;
  sourceName: string;
  samplingFrequencyKhz: 16 | 24 | 32 | 44.1 | 48;
  bitrateKbps: number;
  encryptionState: 'UNENCRYPTED_PUBLIC' | 'PIN_PROTECTED';
  signalStrengthDbm: number;
  subgroupsCount: number;
  latencyMs: number;
}

export interface LeAudioSyncState {
  activeSource?: AuracastSourceAnnouncement;
  isSynchronized: boolean;
  packetLossConcealmentRate: number;
  volumeLevelPercent: number;
  codec: AudioCodecType;
  availablePublicBroadcasts: AuracastSourceAnnouncement[];
}

/**
 * Calculates LC3 low-complexity communications codec efficiency vs legacy SBC.
 * LC3 delivers equal/better subjective MOS audio quality at 50% the bitrate of SBC,
 * reducing Bluetooth battery consumption by ~40%.
 */
export function calculateCodecPowerSavings(
  targetBitrateKbps: number,
  codec: AudioCodecType
): { estimatedPowerDrawMilliWatts: number; powerSavingsPercent: number; latencyFrameMs: number } {
  let estimatedPowerDrawMilliWatts = 18.5; // SBC baseline
  let powerSavingsPercent = 0;
  let latencyFrameMs = 25.0;

  switch (codec) {
    case 'LC3_STANDARD':
      estimatedPowerDrawMilliWatts = 11.2;
      powerSavingsPercent = 39.5;
      latencyFrameMs = 10.0;
      break;
    case 'LC3_PLUS_HIGH_RES':
      estimatedPowerDrawMilliWatts = 13.8;
      powerSavingsPercent = 25.4;
      latencyFrameMs = 5.0; // ultra low latency
      break;
    case 'SBC_LEGACY':
    default:
      estimatedPowerDrawMilliWatts = 18.5;
      powerSavingsPercent = 0;
      latencyFrameMs = 25.0;
      break;
  }

  return {
    estimatedPowerDrawMilliWatts,
    powerSavingsPercent,
    latencyFrameMs,
  };
}

export function getSampleAuracastBroadcasts(): AuracastSourceAnnouncement[] {
  return [
    {
      broadcastId: 'AUR-GATE-12',
      sourceName: 'Airport Flight Gate 12 Announcements',
      samplingFrequencyKhz: 48,
      bitrateKbps: 96,
      encryptionState: 'UNENCRYPTED_PUBLIC',
      signalStrengthDbm: -54,
      subgroupsCount: 2, // Stereo
      latencyMs: 10,
    },
    {
      broadcastId: 'AUR-CINEMA-03',
      sourceName: 'Theater Screen 3 Multi-Language Track',
      samplingFrequencyKhz: 48,
      bitrateKbps: 128,
      encryptionState: 'UNENCRYPTED_PUBLIC',
      signalStrengthDbm: -68,
      subgroupsCount: 4, // 5.1 surround downmix
      latencyMs: 7.5,
    },
  ];
}
