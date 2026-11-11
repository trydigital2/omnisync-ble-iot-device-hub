import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { evaluateMeshProvisioning, MeshProvisioningState } from '../utils/meshProvisioningEngine';
import { colors, spacing, borderRadius, typography } from '../theme';

export interface MeshProvisioningCardProps {
  deviceUuid?: string;
  sequenceId?: number;
  state?: MeshProvisioningState;
  onProvisionToggle?: () => void;
}

export const MeshProvisioningCard: React.FC<MeshProvisioningCardProps> = ({
  deviceUuid = 'A8:05:41:9C:20:11',
  sequenceId = 42,
  state = 'RELAY_ACTIVE',
  onProvisionToggle,
}) => {
  const node = evaluateMeshProvisioning(deviceUuid, sequenceId, state);

  const getStateColor = () => {
    switch (node.provisioningState) {
      case 'RELAY_ACTIVE':
      case 'DATA_PROVISIONED':
        return colors.accent;
      case 'PUBLIC_KEY_EXCHANGED':
      case 'AUTHENTICATING':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const stateColor = getStateColor();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.label}>BLUETOOTH MESH SIG PROFILE</Text>
          <Text style={styles.title}>{node.nodeName}</Text>
          <Text style={styles.uuidText}>{node.deviceMac}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: stateColor + '20' }]}>
          <Text style={[styles.badgeText, { color: stateColor }]}>
            {node.provisioningState.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Network Attributes Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>UNICAST ADDR</Text>
          <Text style={[styles.metricVal, { color: colors.primaryLight }]}>
            {node.assignedUnicastAddressHex}
          </Text>
          <Text style={styles.metricSub}>Subnet NetKey #{node.networkKeyIndex}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>TTL HOPS</Text>
          <Text style={styles.metricVal}>{node.relayTtlMaxHops} <Text style={styles.unit}>hops</Text></Text>
          <Text style={styles.metricSub}>Relay Enabled</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>APP MODEL</Text>
          <Text style={styles.metricVal}>AppKey #{node.appKeyIndex}</Text>
          <Text style={styles.metricSub}>GATT Proxy Ready</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>MESH HEALTH</Text>
          <Text style={[styles.metricVal, { color: stateColor }]}>
            {node.networkHealthScore}%
          </Text>
          <Text style={styles.metricSub}>Signal Optimal</Text>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onProvisionToggle} activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {state === 'RELAY_ACTIVE' ? 'Re-configure Mesh Parameters' : 'Provision Node into Mesh'}
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
  titleGroup: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: 10,
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
  uuidText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 2,
  },
  unit: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metricSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
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

export default MeshProvisioningCard;
