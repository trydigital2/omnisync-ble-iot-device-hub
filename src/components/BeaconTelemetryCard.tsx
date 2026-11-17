import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  BeaconDeviceRecord,
  estimateBeaconDistance,
  formatBeaconUptime,
} from '../utils/beaconTelemetryEngine';

interface BeaconTelemetryCardProps {
  beacon: BeaconDeviceRecord;
  onRefreshBroadcast?: () => void;
}

export const BeaconTelemetryCard: React.FC<BeaconTelemetryCardProps> = ({
  beacon,
  onRefreshBroadcast,
}) => {
  const [rssi, setRssi] = useState<number>(beacon.currentRssiDbm);
  const proximity = estimateBeaconDistance(rssi, beacon.uid?.txPower0m ?? -59);

  const getZoneBadge = () => {
    switch (proximity.zone) {
      case 'IMMEDIATE':
        return { bg: '#064E3B', text: '#34D399', label: 'IMMEDIATE PROXIMITY' };
      case 'NEAR':
        return { bg: '#083344', text: '#38BDF8', label: 'NEAR FIELD (<3M)' };
      case 'FAR':
        return { bg: '#422006', text: '#FBBF24', label: 'PERIMETER (<15M)' };
      case 'OUT_OF_RANGE':
      default:
        return { bg: '#450A0A', text: '#F87171', label: 'SIGNAL LOST' };
    }
  };

  const badge = getZoneBadge();

  const simulatePing = () => {
    const delta = Math.floor(Math.random() * 7) - 3;
    setRssi((prev) => Math.min(-35, Math.max(-95, prev + delta)));
    if (onRefreshBroadcast) onRefreshBroadcast();
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
        <Text style={styles.macAddress}>{beacon.macAddress}</Text>
      </View>

      <Text style={styles.title}>{beacon.name}</Text>
      <Text style={styles.frameTypeText}>
        Frame: {beacon.frameType} • Namespace: {beacon.uid?.namespaceId}
      </Text>

      {/* Proximity / RSSI row */}
      <View style={styles.telemetryGrid}>
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>Signal</Text>
          <Text style={[styles.cellValue, { color: colors.primaryLight }]}>
            {rssi} dBm
          </Text>
        </View>
        <View style={styles.cellDivider} />
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>Distance</Text>
          <Text style={styles.cellValue}>~{proximity.distanceMeters} m</Text>
        </View>
        <View style={styles.cellDivider} />
        <View style={styles.metricCell}>
          <Text style={styles.cellLabel}>Calibrated</Text>
          <Text style={styles.cellValue}>{beacon.uid?.txPower0m ?? -59} dBm</Text>
        </View>
      </View>

      {/* Eddystone TLM Sensor Telemetry */}
      {beacon.tlm && (
        <View style={styles.tlmBox}>
          <Text style={styles.tlmHeader}>Eddystone-TLM Diagnostic Frame</Text>
          <View style={styles.tlmRow}>
            <View style={styles.tlmItem}>
              <Text style={styles.tlmLabel}>Coin Battery</Text>
              <Text style={styles.tlmValue}>
                {(beacon.tlm.batteryVoltageMv / 1000).toFixed(2)} V
              </Text>
            </View>
            <View style={styles.tlmItem}>
              <Text style={styles.tlmLabel}>Die Temp</Text>
              <Text style={styles.tlmValue}>{beacon.tlm.beaconTemperatureC}°C</Text>
            </View>
            <View style={styles.tlmItem}>
              <Text style={styles.tlmLabel}>PDU Count</Text>
              <Text style={styles.tlmValue}>
                {(beacon.tlm.advertisingPduCount / 1000).toFixed(0)}k
              </Text>
            </View>
            <View style={styles.tlmItem}>
              <Text style={styles.tlmLabel}>Uptime</Text>
              <Text style={styles.tlmValue}>
                {formatBeaconUptime(beacon.tlm.uptimeSeconds)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Ping button */}
      <TouchableOpacity
        style={styles.pingButton}
        onPress={simulatePing}
        activeOpacity={0.8}
      >
        <Text style={styles.pingButtonText}>📡 Ping Beacon Packet Stream</Text>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  macAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'Courier',
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  frameTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  telemetryGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricCell: {
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  cellDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  tlmBox: {
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tlmHeader: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryLight,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  tlmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tlmItem: {
    alignItems: 'center',
  },
  tlmLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  tlmValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  pingButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  pingButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
