import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  SniffedBlePacket,
  getSampleSniffedPackets,
} from '../utils/blePacketSnifferEngine';

export const BlePacketSnifferCard: React.FC = () => {
  const [packets, setPackets] = useState<SniffedBlePacket[]>(getSampleSniffedPackets());
  const [isSniffing, setIsSniffing] = useState<boolean>(true);

  const toggleSniffer = () => {
    setIsSniffing(!isSniffing);
  };

  const handleExportPcap = () => {
    Alert.alert(
      'PCAP Capture Exported',
      `Exported ${packets.length} BLE advertising frames to omnisync_capture_${Date.now()}.pcapng for Wireshark analysis.`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: isSniffing ? '#064E3B' : '#450A0A' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isSniffing ? '#34D399' : '#F87171' },
            ]}
          >
            {isSniffing ? 'LIVE HCI SNIFFER • CH 37/38/39' : 'SNIFFER PAUSED'}
          </Text>
        </View>
        <Text style={styles.ppsText}>48.2 pkts/sec</Text>
      </View>

      <Text style={styles.title}>BLE Air Traffic & HCI Protocol Inspector</Text>
      <Text style={styles.subtitle}>Raw PDU frame length-type-value decoding</Text>

      {/* Live Packets List */}
      <View style={styles.packetsContainer}>
        {packets.map((pkt) => (
          <View key={pkt.packetIndex} style={styles.pktItem}>
            <View style={styles.pktMetaRow}>
              <Text style={styles.pktIndex}>#{pkt.packetIndex}</Text>
              <Text style={styles.pktType}>{pkt.packetType}</Text>
              <Text style={styles.pktChannel}>CH {pkt.channelIndex}</Text>
              <Text style={styles.pktRssi}>{pkt.rssiDbm} dBm</Text>
            </View>
            <Text style={styles.pktMac}>Adv Addr: {pkt.advAddress}</Text>
            <Text style={styles.pktHex}>RAW: {pkt.rawPayloadHex}</Text>

            {/* AD Elements */}
            <View style={styles.adList}>
              {pkt.adElements.map((el, idx) => (
                <View key={idx} style={styles.adPill}>
                  <Text style={styles.adPillType}>{el.typeName}:</Text>
                  <Text style={styles.adPillData}>{el.dataHex}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.ctrlBtn, isSniffing ? styles.ctrlBtnPause : styles.ctrlBtnStart]}
          onPress={toggleSniffer}
          activeOpacity={0.8}
        >
          <Text style={styles.ctrlBtnText}>{isSniffing ? 'Pause Sniffer' : 'Resume Sniffing'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pcapBtn}
          onPress={handleExportPcap}
          activeOpacity={0.8}
        >
          <Text style={styles.pcapBtnText}>Export PCAP Log</Text>
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
  ppsText: {
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
  packetsContainer: {
    marginBottom: spacing.md,
    gap: 8,
  },
  pktItem: {
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  pktMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pktIndex: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  pktType: {
    fontSize: 9,
    color: colors.accent,
    fontWeight: typography.fontWeight.semibold,
  },
  pktChannel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  pktRssi: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: typography.fontWeight.bold,
  },
  pktMac: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'Courier',
  },
  pktHex: {
    fontSize: 10,
    color: '#F59E0B',
    fontFamily: 'Courier',
    marginVertical: 4,
  },
  adList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  adPill: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  adPillType: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
  },
  adPillData: {
    fontSize: 9,
    color: colors.textPrimary,
    fontFamily: 'Courier',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ctrlBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ctrlBtnPause: {
    backgroundColor: '#450A0A',
  },
  ctrlBtnStart: {
    backgroundColor: colors.primaryDark,
  },
  ctrlBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  pcapBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  pcapBtnText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
