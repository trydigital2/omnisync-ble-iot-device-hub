import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  FirmwareManifest,
  OtaTransferState,
  calculateOtaChunks,
  computeOtaStreamingMetrics,
} from '../utils/bleOtaUpdateEngine';

interface BleOtaUpdateCardProps {
  manifest: FirmwareManifest;
  onUpdateComplete?: () => void;
}

export const BleOtaUpdateCard: React.FC<BleOtaUpdateCardProps> = ({
  manifest,
  onUpdateComplete,
}) => {
  const [transferState, setTransferState] = useState<OtaTransferState>('IDLE');
  const [bytesStreamed, setBytesStreamed] = useState<number>(0);

  const chunkInfo = calculateOtaChunks(manifest.imageSizeBytes, 244);
  const metrics = computeOtaStreamingMetrics(
    bytesStreamed,
    manifest.imageSizeBytes,
    bytesStreamed > 0 ? (bytesStreamed / (24 * 1024)) : 0.1
  );

  const startDfuUpdate = () => {
    setTransferState('BOOTLOADER_INIT');
    setTimeout(() => {
      setTransferState('STREAMING_CHUNKS');
      setBytesStreamed(Math.round(manifest.imageSizeBytes * 0.65));
      setTimeout(() => {
        setTransferState('CRC_VALIDATING');
        setBytesStreamed(manifest.imageSizeBytes);
        setTimeout(() => {
          setTransferState('UPDATE_SUCCESS');
          if (onUpdateComplete) onUpdateComplete();
        }, 1200);
      }, 1500);
    }, 1000);
  };

  const getStatusBadge = () => {
    switch (transferState) {
      case 'STREAMING_CHUNKS':
        return { bg: '#083344', text: '#38BDF8', label: 'STREAMING CHUNKS' };
      case 'CRC_VALIDATING':
        return { bg: '#422006', text: '#FBBF24', label: 'CRC-32 VERIFY' };
      case 'UPDATE_SUCCESS':
        return { bg: '#064E3B', text: '#34D399', label: 'FIRMWARE INSTALLED' };
      case 'TRANSFER_FAILED':
        return { bg: '#450A0A', text: '#F87171', label: 'DFU FAILED' };
      default:
        return { bg: '#1E293B', text: '#94A3B8', label: 'READY TO FLASH' };
    }
  };

  const badge = getStatusBadge();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
        <Text style={styles.deviceIdText}>{manifest.targetDeviceId}</Text>
      </View>

      <Text style={styles.title}>BLE DFU Firmware Update</Text>
      <Text style={styles.hardwareText}>Hardware: {manifest.hardwareRevision}</Text>

      <View style={styles.versionRow}>
        <View style={styles.versionCol}>
          <Text style={styles.versionLabel}>Current</Text>
          <Text style={styles.versionVal}>{manifest.currentFirmwareVersion}</Text>
        </View>
        <Text style={styles.arrowIcon}>→</Text>
        <View style={styles.versionCol}>
          <Text style={styles.versionLabel}>Target</Text>
          <Text style={[styles.versionVal, { color: colors.primary }]}>
            {manifest.targetFirmwareVersion}
          </Text>
        </View>
      </View>

      <View style={styles.metricsBox}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Image Size</Text>
          <Text style={styles.metricValue}>
            {(manifest.imageSizeBytes / 1024).toFixed(1)} KB
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>ATT MTU Chunks</Text>
          <Text style={styles.metricValue}>{chunkInfo.totalChunks} pkts</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CRC-32</Text>
          <Text style={styles.metricValue}>{manifest.crc32Checksum}</Text>
        </View>
      </View>

      {transferState !== 'IDLE' && transferState !== 'UPDATE_SUCCESS' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressPercentText}>{metrics.progressPercent}% Transferred</Text>
            <Text style={styles.progressRateText}>{metrics.transferRateKbs} KB/s</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${metrics.progressPercent}%` }]} />
          </View>
          <View style={styles.etaRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.etaText}>Validating dual-bank flash bootloader...</Text>
          </View>
        </View>
      )}

      {transferState === 'IDLE' ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={startDfuUpdate}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Initiate Over-The-Air Flash</Text>
        </TouchableOpacity>
      ) : transferState === 'UPDATE_SUCCESS' ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ Node running {manifest.targetFirmwareVersion}</Text>
        </View>
      ) : null}
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
  deviceIdText: {
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
  hardwareText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  versionCol: {
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  versionVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  metricsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPercentText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  progressRateText: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryLight,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  etaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  actionButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  successBanner: {
    backgroundColor: '#064E3B',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  successText: {
    color: '#34D399',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
