import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native';
import { BleDeviceCard } from './src/components/BleDeviceCard';
import { colors, spacing, typography } from './src/theme';

export default function App() {
  const [isConnected, setIsConnected] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.tag}>OMNISYNC TELEMETRY</Text>
          <Text style={styles.title}>BLE & IoT Device Hub</Text>
          <Text style={styles.subtitle}>Real-time peripheral RSSI telemetry and GATT services</Text>
        </View>

        <BleDeviceCard
          id="A4:C1:38:F2:99:12"
          name="Environmental Sensor B4"
          rssiDbm={-58}
          batteryPercent={94}
          connectionState={isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          onConnectToggle={() => setIsConnected(!isConnected)}
        />

        <BleDeviceCard
          id="F2:88:01:BC:44:89"
          name="Nordic nRF52 Mesh Node"
          rssiDbm={-79}
          batteryPercent={64}
          connectionState="SCANNING"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginVertical: spacing.lg,
  },
  tag: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
