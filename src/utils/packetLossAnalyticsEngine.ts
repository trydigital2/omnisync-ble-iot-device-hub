export interface BleLatencyDataPoint {
  sequenceNumber: number;
  rttLatencyMs: number;
  retransmitted: boolean;
  rssiDbm: number;
}

export interface BleConnectionAnalytics {
  connectionIntervalMs: number;
  totalTransmittedPackets: number;
  totalNackRetransmissions: number;
  packetErrorRatePercent: number; // PER %
  averageRttLatencyMs: number;
  jitterMs: number;
  channelCongestionLevel: 'LOW' | 'MODERATE' | 'SEVERE_INTERFERENCE';
  recentDataPoints: BleLatencyDataPoint[];
}

/**
 * Calculates connection event packet error rate (PER) and round-trip latency statistics.
 */
export function calculateBleConnectionAnalytics(
  dataPoints: BleLatencyDataPoint[],
  connectionIntervalMs: number = 15.0
): BleConnectionAnalytics {
  const totalTransmittedPackets = dataPoints.length;
  const retransmittedCount = dataPoints.filter((p) => p.retransmitted).length;
  const packetErrorRatePercent =
    totalTransmittedPackets > 0
      ? Math.round((retransmittedCount / totalTransmittedPackets) * 1000) / 10
      : 0;

  const latencies = dataPoints.map((p) => p.rttLatencyMs);
  const sumLatency = latencies.reduce((a, b) => a + b, 0);
  const averageRttLatencyMs =
    latencies.length > 0 ? Math.round((sumLatency / latencies.length) * 10) / 10 : 0;

  // Compute jitter (mean deviation)
  const jitterSum = latencies.reduce((acc, lat) => acc + Math.abs(lat - averageRttLatencyMs), 0);
  const jitterMs = latencies.length > 0 ? Math.round((jitterSum / latencies.length) * 10) / 10 : 0;

  let channelCongestionLevel: 'LOW' | 'MODERATE' | 'SEVERE_INTERFERENCE' = 'LOW';
  if (packetErrorRatePercent > 12 || averageRttLatencyMs > 45) {
    channelCongestionLevel = 'SEVERE_INTERFERENCE';
  } else if (packetErrorRatePercent > 4 || averageRttLatencyMs > 25) {
    channelCongestionLevel = 'MODERATE';
  }

  return {
    connectionIntervalMs,
    totalTransmittedPackets,
    totalNackRetransmissions: retransmittedCount,
    packetErrorRatePercent,
    averageRttLatencyMs,
    jitterMs,
    channelCongestionLevel,
    recentDataPoints: dataPoints,
  };
}

export function getSampleLatencyDataPoints(): BleLatencyDataPoint[] {
  return [
    { sequenceNumber: 101, rttLatencyMs: 14.2, retransmitted: false, rssiDbm: -58 },
    { sequenceNumber: 102, rttLatencyMs: 15.1, retransmitted: false, rssiDbm: -59 },
    { sequenceNumber: 103, rttLatencyMs: 38.6, retransmitted: true, rssiDbm: -72 },
    { sequenceNumber: 104, rttLatencyMs: 14.8, retransmitted: false, rssiDbm: -57 },
    { sequenceNumber: 105, rttLatencyMs: 15.4, retransmitted: false, rssiDbm: -58 },
    { sequenceNumber: 106, rttLatencyMs: 42.0, retransmitted: true, rssiDbm: -74 },
    { sequenceNumber: 107, rttLatencyMs: 14.0, retransmitted: false, rssiDbm: -56 },
    { sequenceNumber: 108, rttLatencyMs: 16.2, retransmitted: false, rssiDbm: -60 },
  ];
}
