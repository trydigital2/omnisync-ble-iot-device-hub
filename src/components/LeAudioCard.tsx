import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  AuracastSourceAnnouncement,
  calculateCodecPowerSavings,
  getSampleAuracastBroadcasts,
} from '../utils/leAudioEngine';

export const LeAudioCard: React.FC = () => {
  const sources = getSampleAuracastBroadcasts();
  const [activeBroadcastId, setActiveBroadcastId] = useState<string | null>(sources[0].broadcastId);
  const [synced, setSynced] = useState<boolean>(true);

  const activeSource = sources.find((s) => s.broadcastId === activeBroadcastId) || sources[0];
  const codecStats = calculateCodecPowerSavings(activeSource.bitrateKbps, 'LC3_STANDARD');

  const handleToggleSync = (source: AuracastSourceAnnouncement) => {
    setActiveBroadcastId(source.broadcastId);
    setSynced(true);
    Alert.alert(
      'Auracast Broadcast Synchronized',
      `Tuned into "${source.sourceName}" via BIS channel at ${source.samplingFrequencyKhz}kHz / ${source.bitrateKbps}kbps LC3 stream.`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🎧 BLUETOOTH LE AUDIO • AURACAST</Text>
        </View>
        <Text style={styles.latencyText}>{codecStats.latencyFrameMs} ms latency</Text>
      </View>

      <Text style={styles.title}>Auracast Broadcast Assistant</Text>
      <Text style={styles.subtitle}>LC3 Codec Isochronous Audio Streaming</Text>

      {/* Codec Performance Grid */}
      <View style={styles.codecBanner}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Active Codec</Text>
          <Text style={[styles.metricVal, { color: colors.primaryLight }]}>LC3 Low-Power</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Power Savings</Text>
          <Text style={[styles.metricVal, { color: '#34D399' }]}>
            +{codecStats.powerSavingsPercent}%
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Power Draw</Text>
          <Text style={styles.metricVal}>{codecStats.estimatedPowerDrawMilliWatts} mW</Text>
        </View>
      </View>

      {/* Broadcast Channels List */}
      <Text style={styles.sectionHeading}>Nearby Public Audio Streams</Text>
      <View style={styles.streamList}>
        {sources.map((s) => {
          const isTuned = s.broadcastId === activeBroadcastId && synced;
          return (
            <View key={s.broadcastId} style={styles.streamItem}>
              <View style={styles.streamInfo}>
                <Text style={styles.streamName}>{s.sourceName}</Text>
                <Text style={styles.streamSub}>
                  {s.samplingFrequencyKhz}kHz • {s.bitrateKbps}kbps • {s.signalStrengthDbm} dBm
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.tuneBtn, isTuned && styles.tuneBtnActive]}
                onPress={() => handleToggleSync(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tuneBtnText, isTuned && styles.tuneBtnTextActive]}>
                  {isTuned ? '● SYNCED' : 'Tune In'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
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
  latencyText: {
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
  codecBanner: {
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
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  streamList: {
    gap: 8,
  },
  streamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  streamInfo: {
    flex: 1,
  },
  streamName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  streamSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tuneBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  tuneBtnActive: {
    backgroundColor: '#064E3B',
  },
  tuneBtnText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  tuneBtnTextActive: {
    color: '#34D399',
  },
});
