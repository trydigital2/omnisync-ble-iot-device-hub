import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  BleConnectionAnalytics,
  calculateBleConnectionAnalytics,
  getSampleLatencyDataPoints,
} from '../utils/packetLossAnalyticsEngine';

export const PacketLossChartCard: React.FC = () => {
  const [dataPoints, setDataPoints] = useState(getSampleLatencyDataPoints());
  const analytics: BleConnectionAnalytics = calculateBleConnectionAnalytics(dataPoints, 15.0);

  const handleTuneConnectionInterval = () => {
    Alert.alert(
      'PHY Layer Auto-Adaptation Triggered',
      `Negotiating 2M PHY with connection interval 7.5ms to reduce PER from ${analytics.packetErrorRatePercent}% to <1.5%.`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📊 BLE PACKET LOSS & LATENCY</Text>
        </View>
        <Text style={styles.intervalText}>{analytics.connectionIntervalMs}ms interval</Text>
      </View>

      <Text style={styles.title}>Packet Retransmission & RTT Analytics</Text>
      <Text style={styles.subtitle}>
        Link-layer ACK/NACK supervision telemetry & interference analysis
      </Text>

      {/* Analytics Overview Box */}
      <View style={styles.metricsBox}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Packet Error Rate</Text>
          <Text style={[styles.metricVal, { color: analytics.packetErrorRatePercent > 5 ? '#F59E0B' : '#34D399' }]}>
            {analytics.packetErrorRatePercent}% PER
          </Text>
          <Text style={styles.metricSub}>{analytics.totalNackRetransmissions} NACKs</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Average RTT</Text>
          <Text style={[styles.metricVal, { color: colors.primaryLight }]}>
            {analytics.averageRttLatencyMs} ms
          </Text>
          <Text style={styles.metricSub}>Jitter ±{analytics.jitterMs}ms</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>RF Congestion</Text>
          <Text style={[styles.metricVal, { color: '#34D399' }]}>
            {analytics.channelCongestionLevel}
          </Text>
          <Text style={styles.metricSub}>2.4GHz ISM Band</Text>
        </View>
      </View>

      {/* Latency Histogram Bars */}
      <Text style={styles.sectionHeading}>RTT Latency Trend (Recent Packets)</Text>
      <View style={styles.chartContainer}>
        {dataPoints.map((pt) => {
          const heightPercent = Math.min(100, Math.max(15, (pt.rttLatencyMs / 50) * 100));
          return (
            <View key={pt.sequenceNumber} style={styles.barCol}>
              <View
                style={[
                  styles.barFill,
                  { height: `${heightPercent}%` },
                  pt.retransmitted && styles.barRetransmit,
                ]}
              />
              <Text style={styles.barLabel}>{pt.rttLatencyMs.toFixed(0)}</Text>
            </View>
          );
        })}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.tuneBtn}
        onPress={handleTuneConnectionInterval}
        activeOpacity={0.8}
      >
        <Text style={styles.tuneBtnText}>Adapt Connection Parameters (2M PHY)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    backgroundColor: '#083344',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  intervalText: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.bold,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  barRetransmit: {
    backgroundColor: '#F59E0B',
  },
  barLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
  tuneBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  tuneBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
