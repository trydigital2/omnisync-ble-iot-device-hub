# 📡 OmniSync — Cross-Platform BLE & IoT Telemetry Hub

> A high-performance React Native mobile telemetry application engineered with **TypeScript**, **Bluetooth Low Energy (BLE)** peripheral signal modeling, **Log-Distance Path Loss proximity estimation**, GATT characteristic binary stream parsing, and real-time environmental IoT analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![BLE Architecture](https://img.shields.io/badge/Bluetooth_LE-GATT_v5.3-0082FC?style=for-the-badge&logo=bluetooth&logoColor=white)](https://www.bluetooth.com/)
[![Design System](https://img.shields.io/badge/UI-Cyber_IoT_Tokens-06B6D4?style=for-the-badge)](src/theme/index.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 📱 App Interface Overview & Mobile Screens

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      OMNISYNC BLE TELEMETRY HUB                        │
├───────────────────┬───────────────────┬────────────────────────────────┤
│  📡 Peripheral Hub│  📊 Signal Engine │  ⚡ GATT Stream Reader         │
│  - Beacon B4      │  - RSSI (-58 dBm) │  - Temp (24.8° C)              │
│  - nRF52 Mesh     │  - Path Loss N=2.4│  - Humidity (58.4 %)           │
│  - ESP32 Gateway  │  - Est. Dist (~1m)│  - Pressure (1013.4 hPa)       │
│  - Smart Valve    │  - 92% Quality    │  - Cell Voltage (3.26 V)       │
│  - Health Tracker │  - 24 pkts/sec    │  - CRC-16 Checksum Verified    │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 🌟 Key Highlights & Engineering Features

### 1. 🧮 Log-Distance Path Loss Proximity Engine
- **Radio Frequency Distance Formulation:** Computes real-time physical proximity from Bluetooth Received Signal Strength Indicator (RSSI) using the environmental path loss model:
  $$d = 10^{\frac{P_{tx} - \text{RSSI}}{10 \cdot n}}$$
  where $P_{tx} = -59\text{ dBm}$ (1-meter calibrated reference power) and $n = 2.4$ (indoor obstruction path loss exponent).
- **Signal Quality Normalization:** Normalizes hardware RSSI range ($-100\text{ dBm}$ minimum sensitivity to $-40\text{ dBm}$ near-contact peak) into a standardized 0–100% telemetry index with five discrete connection tiers (`EXCELLENT`, `GOOD`, `FAIR`, `WEAK`, `CRITICAL`).

### 2. ⚡ GATT Characteristic Stream Decoder (UUID 0x2A6E)
- **Binary Buffer Ingestion:** Decodes multi-byte sensor payloads from IoT environmental micro-controllers (Nordic nRF52, Espressif ESP32, STM32WB).
- **High-Precision Metric Unpacking:**
  - **Temperature:** Little-endian 16-bit integer scaled to $0.1^\circ\text{C}$ resolution.
  - **Relative Humidity:** 16-bit word scaled to $0.1\%\text{ RH}$.
  - **Barometric Atmospheric Pressure:** Offset hectopascal calculation ($1013.25\text{ hPa}$ nominal).
  - **Cell Voltage:** Sub-millivolt lithium-ion curve tracking with battery drop alarms.

### 3. 🌌 Cyberpunk IoT Dark Theme System
- Designed specifically for field engineering, sensor monitoring, and hardware diagnostics:
  - **Surfaces:** Deep space slate (`#0B0F19`) and container dark slate (`#111827`).
  - **Accents:** Neon telemetry cyan (`#06B6D4`), connected emerald (`#10B981`), and warning amber (`#F59E0B`).

---

## 📊 BLE Peripheral Signal Calibration Matrix

| Distance Category | RSSI Threshold | Signal Quality | Recommended Action |
| :--- | :---: | :---: | :--- |
| **Immediate Contact** | $> -50\text{ dBm}$ | $90\% - 100\%$ | High-speed OTA firmware upgrade & bulk flash sync |
| **Near Field (1m - 3m)** | $-50\text{ to } -65\text{ dBm}$ | $75\% - 89\%$ | Continuous high-frequency sensor streaming |
| **Mid Field (3m - 8m)** | $-66\text{ to } -80\text{ dBm}$ | $45\% - 74\%$ | Throttle packet rate to 5 Hz to conserve battery |
| **Far Field (8m - 15m)** | $-81\text{ to } -92\text{ dBm}$ | $20\% - 44\%$ | Unicast retries with connection interval step-up |
| **Connection Drop Risk** | $< -92\text{ dBm}$ | $< 20\%$ | Trigger graceful disconnect & peripheral search |

---

## 📁 Repository Directory Structure

```text
omnisync-ble-iot-device-hub/
├── src/
│   ├── components/
│   │   ├── BleDeviceCard.tsx         # Peripheral card with RSSI gauge & state
│   │   └── GattTelemetryCard.tsx     # Environmental stream reader card
│   ├── theme/
│   │   └── index.ts                  # Cyber IoT design tokens, colors & spacing
│   └── utils/
│       ├── bleSignalEngine.ts        # Path loss distance & signal quality engine
│       └── gattStreamEngine.ts       # Binary payload decoding & CRC checks
├── App.tsx                           # Main telemetry dashboard view
├── package.json                      # Dependencies & typecheck scripts
├── tsconfig.json                     # Strict TypeScript compiler options
└── README.md                         # Architecture specification & documentation
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone git@github.com:trydigital2/omnisync-ble-iot-device-hub.git
cd omnisync-ble-iot-device-hub

# Run TypeScript Typecheck
npm run typecheck

# Start Expo Local Development
npx expo start
```

---

<sub>Architected & engineered with precision by **Trydigital** · © 2026 All Rights Reserved</sub>
