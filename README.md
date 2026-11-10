# 📡 OmniSync BLE & IoT Device Hub

> Production-ready React Native & TypeScript IoT telemetry dashboard and Bluetooth Low Energy (BLE) peripheral manager with real-time RSSI signal quality estimation, log-distance path loss proximity calculation, and GATT characteristics stream reader.

---

## 🌟 Key Capabilities
- **Log-Distance Path Loss Estimator**: Converts raw RSSI dBm signal strength into real-time distance proximity (meters) with configurable path loss exponents ($N=2.0$ to $N=4.0$).
- **Normalized Signal Quality Index**: Standardizes $-100 \text{ dBm}$ to $-40 \text{ dBm}$ range into a 0-100% signal rating with five discrete connection tiers.
- **Peripheral Telemetry Card**: Clean Cyber-IoT UI visualizing MAC addresses, transmission power, battery life, and packet transmission rates.
- **Zero-Dependency TypeScript Math**: High performance native-grade arithmetic isolated from platform libraries.

---

## 🛠️ Architecture & Tech Stack
- **Framework**: React Native / Expo
- **Language**: TypeScript (Strict Mode)
- **Styling**: Cyberpunk IoT Design Tokens (`src/theme`)
- **Telemetry Engine**: `src/utils/bleSignalEngine.ts`
- **UI Components**: `src/components/BleDeviceCard.tsx`

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone git@github.com:trydigital2/omnisync-ble-iot-device-hub.git
cd omnisync-ble-iot-device-hub

# Run TypeScript Typecheck
npm run typecheck
```

---

<sub>Built with precision by **Trydigital** · © 2026 All Rights Reserved</sub>
