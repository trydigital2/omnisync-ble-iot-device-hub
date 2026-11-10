import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { evaluateDeviceMetrics, BleConnectionState } from '../utils/bleSignalEngine';
import { colors, spacing, borderRadius, typography } from '../theme';

export interface BleDeviceCardProps {
  id?: string;
  name?: string;
  rssiDbm?: number;
  batteryPercent?: number;
  connectionState?: BleConnectionState;
  onConnectToggle?: () => void;
}

export const BleDeviceCard: React.FC<BleDeviceCardProps> = ({
  id = 'A4:C1:38:F2:99:12',
  name = 'Smart Environmental Sensor B4',
  rssiDbm = -62,
  batteryPercent = 92,
  connectionState = 'CONNECTED',
  onConnectToggle,
}) => {
  const metrics = evaluateDeviceMetrics(id, name, rssiDbm, batteryPercent, connectionState);

  const getSignalColor = () => {
    switch (metrics.signalTier) {
      case 'EXCELLENT':
      case 'GOOD':
        return colors.accent;
      case 'FAIR':
        return colors.warning;
      default:
        return colors.error;
    }
  };

  const signalColor = getSignalColor();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.label}>BLE PERIPHERAL</Text>
          <Text style={styles.name}>{metrics.name}</Text>
          <Text style={styles.macAddress}>{metrics.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: signalColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: signalColor }]} />
          <Text style={[styles.statusText, { color: signalColor }]}>
            {metrics.connectionState}
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>SIGNAL (RSSI)</Text>
          <Text style={[styles.metricValue, { color: signalColor }]}>
            {metrics.rssiDbm} <Text style={styles.unit}>dBm</Text>
          </Text>
          <Text style={styles.metricSub}>{metrics.signalQualityPercent}% Quality</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>EST. DISTANCE</Text>
          <Text style={styles.metricValue}>
            ~{metrics.distanceEstimateMeters} <Text style={styles.unit}>m</Text>
          </Text>
          <Text style={styles.metricSub}>Path Loss N=2.4</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>BATTERY</Text>
          <Text style={[styles.metricValue, { color: colors.primaryLight }]}>
            {metrics.batteryPercent}%
          </Text>
          <Text style={styles.metricSub}>{metrics.packetRatePerSec} pkts/s</Text>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onConnectToggle} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {connectionState === 'CONNECTED' ? 'Disconnect Device' : 'Connect Peripheral'}
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  macAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 2,
  },
  unit: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metricSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  footer: {
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

export default BleDeviceCard;
