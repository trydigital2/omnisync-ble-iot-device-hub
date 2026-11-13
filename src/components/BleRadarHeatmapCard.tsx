import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  BleRadarTarget,
  getSimulatedRadarTargets,
  computeRadarSweepMetrics,
} from '../utils/bleRadarEngine';
import { colors, spacing, borderRadius, typography } from '../theme';

export interface BleRadarHeatmapCardProps {
  initialTargets?: BleRadarTarget[];
  onSelectTarget?: (target: BleRadarTarget) => void;
}

export const BleRadarHeatmapCard: React.FC<BleRadarHeatmapCardProps> = ({
  initialTargets,
  onSelectTarget,
}) => {
  const [targets] = useState<BleRadarTarget[]>(
    initialTargets && initialTargets.length > 0 ? initialTargets : getSimulatedRadarTargets()
  );
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targets[0]?.id || '');
  const [isLiveScanning, setIsLiveScanning] = useState<boolean>(true);

  const metrics = computeRadarSweepMetrics(targets);
  const activeSelected = targets.find((t) => t.id === selectedTargetId) || targets[0];

  const handleSelect = (target: BleRadarTarget) => {
    setSelectedTargetId(target.id);
    if (onSelectTarget) {
      onSelectTarget(target);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.subtitle}>REAL-TIME SPATIAL TELEMETRY</Text>
          <Text style={styles.title}>BLE Radar & RSSI Heatmap</Text>
        </View>
        <TouchableOpacity
          style={[styles.badge, isLiveScanning ? styles.badgeActive : styles.badgePaused]}
          onPress={() => setIsLiveScanning(!isLiveScanning)}
          activeOpacity={0.8}
        >
          <View style={[styles.pulseDot, isLiveScanning ? styles.pulseDotLive : styles.pulseDotIdle]} />
          <Text style={[styles.badgeText, { color: isLiveScanning ? colors.primaryLight : colors.textMuted }]}>
            {isLiveScanning ? 'LIVE SWEEP' : 'PAUSED'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricBanner}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>DETECTED</Text>
          <Text style={styles.metricVal}>{metrics.totalNodesDetected} <Text style={styles.metricUnit}>nodes</Text></Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CLOSEST</Text>
          <Text style={styles.metricVal}>{metrics.closestNodeDistanceMeters} <Text style={styles.metricUnit}>m</Text></Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>MEAN RSSI</Text>
          <Text style={[styles.metricVal, { color: colors.primaryLight }]}>
            {metrics.averageRssi} <Text style={styles.metricUnit}>dBm</Text>
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>DEGRADED</Text>
          <Text style={[styles.metricVal, { color: metrics.degradedCount > 0 ? colors.warning : colors.accent }]}>
            {metrics.degradedCount} <Text style={styles.metricUnit}>nodes</Text>
          </Text>
        </View>
      </View>

      {/* Radar Canvas Container */}
      <View style={styles.radarContainer}>
        {/* Distance Range Circles */}
        <View style={[styles.ring, styles.ringOuter]}>
          <Text style={styles.ringLabelTop}>10m</Text>
        </View>
        <View style={[styles.ring, styles.ringMid]}>
          <Text style={styles.ringLabelTop}>5m</Text>
        </View>
        <View style={[styles.ring, styles.ringNear]}>
          <Text style={styles.ringLabelTop}>3m</Text>
        </View>
        <View style={[styles.ring, styles.ringCore]}>
          <Text style={styles.ringLabelTop}>1m</Text>
        </View>

        {/* Crosshair Axes */}
        <View style={styles.axisHorizontal} />
        <View style={styles.axisVertical} />

        {/* Center Receiver Node */}
        <View style={styles.centerAnchor}>
          <View style={styles.centerPulse} />
          <View style={styles.centerCore} />
        </View>

        {/* Peripheral Blip Targets */}
        {targets.map((target) => {
          const isSelected = target.id === selectedTargetId;
          // Calculate pixel offset from center (container is 260x260, radius = 130)
          const radarRadius = 120;
          const leftOffset = 130 + (target.cartesianXPercent / 100) * radarRadius - 10;
          const topOffset = 130 + (target.cartesianYPercent / 100) * radarRadius - 10;

          return (
            <TouchableOpacity
              key={target.id}
              style={[
                styles.blipContainer,
                { left: leftOffset, top: topOffset },
                isSelected && styles.blipSelectedGlow,
              ]}
              onPress={() => handleSelect(target)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.blipDot,
                  target.isDegradedSignal ? styles.blipDegraded : styles.blipOptimal,
                  isSelected && styles.blipActiveCore,
                ]}
              />
              {isSelected && <View style={styles.selectionRing} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Target Telemetry Card */}
      {activeSelected && (
        <View style={styles.selectedDetailCard}>
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.selectedTitle}>{activeSelected.name}</Text>
              <Text style={styles.selectedMac}>{activeSelected.macAddress}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                activeSelected.isDegradedSignal ? styles.statusDegraded : styles.statusOptimal,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: activeSelected.isDegradedSignal ? colors.warning : colors.accent },
                ]}
              >
                {activeSelected.isDegradedSignal ? 'DEGRADED RSSI' : 'SIGNAL STABLE'}
              </Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailGridCell}>
              <Text style={styles.cellLabel}>DISTANCE</Text>
              <Text style={styles.cellValue}>{activeSelected.estimatedDistanceMeters} m</Text>
            </View>
            <View style={styles.detailGridCell}>
              <Text style={styles.cellLabel}>ZONE</Text>
              <Text style={styles.cellValue}>{activeSelected.proximityZone}</Text>
            </View>
            <View style={styles.detailGridCell}>
              <Text style={styles.cellLabel}>SIGNAL RSSI</Text>
              <Text
                style={[
                  styles.cellValue,
                  { color: activeSelected.isDegradedSignal ? colors.warning : colors.primaryLight },
                ]}
              >
                {activeSelected.rssi} dBm
              </Text>
            </View>
            <View style={styles.detailGridCell}>
              <Text style={styles.cellLabel}>PACKET LOSS</Text>
              <Text style={styles.cellValue}>
                {(activeSelected.packetLossRate * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Target Quick Switch Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickBar}>
        {targets.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.pill, t.id === selectedTargetId && styles.pillActive]}
            onPress={() => handleSelect(t)}
          >
            <Text
              style={[styles.pillText, t.id === selectedTargetId && styles.pillTextActive]}
              numberOfLines={1}
            >
              {t.name.split(' ')[0]} ({t.estimatedDistanceMeters}m)
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  headerLeft: {
    flex: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primaryDark,
  },
  badgePaused: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pulseDotLive: {
    backgroundColor: colors.primaryLight,
  },
  pulseDotIdle: {
    backgroundColor: colors.textMuted,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  metricBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  radarContainer: {
    width: 260,
    height: 260,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070D18',
    borderRadius: 130,
    borderWidth: 1.5,
    borderColor: colors.primaryDark + '80',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ringOuter: {
    width: 240,
    height: 240,
  },
  ringMid: {
    width: 170,
    height: 170,
    borderColor: colors.primary + '40',
  },
  ringNear: {
    width: 110,
    height: 110,
    borderColor: colors.primary + '50',
  },
  ringCore: {
    width: 50,
    height: 50,
    borderColor: colors.primaryLight + '70',
  },
  ringLabelTop: {
    fontSize: 8,
    color: colors.textMuted,
    position: 'absolute',
    top: 2,
  },
  axisHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: colors.border + '60',
  },
  axisVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: colors.border + '60',
  },
  centerAnchor: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary + '40',
  },
  centerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
  },
  blipContainer: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  blipSelectedGlow: {
    zIndex: 20,
  },
  blipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  blipOptimal: {
    backgroundColor: colors.accent,
  },
  blipDegraded: {
    backgroundColor: colors.warning,
  },
  blipActiveCore: {
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  selectionRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  selectedDetailCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  selectedMac: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusOptimal: {
    backgroundColor: colors.accent + '20',
  },
  statusDegraded: {
    backgroundColor: colors.warning + '20',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  detailGridCell: {
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  quickBar: {
    marginTop: spacing.md,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.semibold,
  },
});
