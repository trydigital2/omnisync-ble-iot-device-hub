import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { decodeGattPayload } from '../utils/gattStreamEngine';
import { colors, spacing, borderRadius, typography } from '../theme';

export interface GattTelemetryCardProps {
  rawHexPayload?: string;
  sequenceNumber?: number;
}

export const GattTelemetryCard: React.FC<GattTelemetryCardProps> = ({
  rawHexPayload = '099216BC0CD0278A',
  sequenceNumber = 1284,
}) => {
  const packet = decodeGattPayload(rawHexPayload, sequenceNumber);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.label}>GATT CHARACTERISTIC STREAM</Text>
          <Text style={styles.title}>UUID 0x2A6E (Environmental Sensor)</Text>
        </View>
        <View style={styles.crcBadge}>
          <Text style={styles.crcText}>{packet.crcValid ? 'CRC OK' : 'CRC ERR'}</Text>
        </View>
      </View>

      {/* Primary Telemetry Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>TEMPERATURE</Text>
          <Text style={styles.metricVal}>
            {packet.temperatureCelsius}° <Text style={styles.unit}>C</Text>
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>HUMIDITY</Text>
          <Text style={[styles.metricVal, { color: colors.primaryLight }]}>
            {packet.humidityPercent}%
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>BAROMETRIC</Text>
          <Text style={styles.metricVal}>
            {packet.pressureHpa} <Text style={styles.unit}>hPa</Text>
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>CELL VOLTAGE</Text>
          <Text style={[styles.metricVal, { color: colors.accent }]}>
            {packet.batteryVoltageVolts} <Text style={styles.unit}>V</Text>
          </Text>
        </View>
      </View>

      {/* Packet Stream Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Packet #{packet.sequenceNumber}</Text>
        <Text style={styles.metaLabel}>Payload: {rawHexPayload}</Text>
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
  titleGroup: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  crcBadge: {
    backgroundColor: colors.accent + '25',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  crcText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  gridItem: {
    width: '50%',
    padding: spacing.xs,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 2,
  },
  unit: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
});

export default GattTelemetryCard;
