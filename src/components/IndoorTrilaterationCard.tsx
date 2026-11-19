import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  AnchorBeacon,
  TrilaterationResult,
  calculateIndoorCentroid,
  getSampleIndoorAnchors,
} from '../utils/indoorTrilaterationEngine';

export const IndoorTrilaterationCard: React.FC = () => {
  const [anchors, setAnchors] = useState<AnchorBeacon[]>(getSampleIndoorAnchors());
  const position: TrilaterationResult = calculateIndoorCentroid(anchors);

  const handleRecalibrate = () => {
    // Add micro jitter to simulate real RF multipath RSSI tracking
    setAnchors((prev) =>
      prev.map((a) => ({
        ...a,
        measuredRssiDbm: a.measuredRssiDbm + (Math.floor(Math.random() * 5) - 2),
      }))
    );
    Alert.alert(
      'Indoor Trilateration Calibrated',
      `Target coordinate: (X: ${position.estimatedX}m, Y: ${position.estimatedY}m). Confidence radius: ±${position.accuracyRadiusMeters}m.`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📍 BLE INDOOR POSITIONING (IPS)</Text>
        </View>
        <Text style={styles.confidenceText}>±{position.accuracyRadiusMeters}m error</Text>
      </View>

      <Text style={styles.title}>Centroid Trilateration Engine</Text>
      <Text style={styles.subtitle}>Multi-anchor RSSI inverse distance weighted positioning</Text>

      {/* Coordinate Readout */}
      <View style={styles.coordBox}>
        <View style={styles.coordCol}>
          <Text style={styles.coordLabel}>X Position</Text>
          <Text style={[styles.coordVal, { color: colors.primaryLight }]}>
            {position.estimatedX} m
          </Text>
        </View>
        <View style={styles.coordDivider} />
        <View style={styles.coordCol}>
          <Text style={styles.coordLabel}>Y Position</Text>
          <Text style={[styles.coordVal, { color: colors.accent }]}>
            {position.estimatedY} m
          </Text>
        </View>
        <View style={styles.coordDivider} />
        <View style={styles.coordCol}>
          <Text style={styles.coordLabel}>Confidence</Text>
          <Text style={styles.coordTier}>{position.confidenceTier.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      {/* Anchor List */}
      <Text style={styles.sectionHeading}>Active Fixed Beacon Anchors</Text>
      <View style={styles.anchorsList}>
        {anchors.map((a) => (
          <View key={a.beaconId} style={styles.anchorRow}>
            <View style={styles.anchorDot} />
            <View style={styles.anchorInfo}>
              <Text style={styles.anchorName}>{a.name}</Text>
              <Text style={styles.anchorCoords}>
                Coords: ({a.xMeters}m, {a.yMeters}m)
              </Text>
            </View>
            <Text style={styles.anchorRssi}>{a.measuredRssiDbm} dBm</Text>
          </View>
        ))}
      </View>

      {/* Calibrate action */}
      <TouchableOpacity
        style={styles.calibBtn}
        onPress={handleRecalibrate}
        activeOpacity={0.8}
      >
        <Text style={styles.calibBtnText}>Re-sample RF Trilateration Sweep</Text>
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
    backgroundColor: '#064E3B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  confidenceText: {
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
  coordBox: {
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
  coordCol: {
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  coordVal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    marginTop: 2,
  },
  coordTier: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: '#34D399',
    marginTop: 4,
  },
  coordDivider: {
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
  anchorsList: {
    gap: 6,
    marginBottom: spacing.md,
  },
  anchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  anchorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  anchorInfo: {
    flex: 1,
  },
  anchorName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  anchorCoords: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  anchorRssi: {
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
    color: '#34D399',
  },
  calibBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  calibBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
