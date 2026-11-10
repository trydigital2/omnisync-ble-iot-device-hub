export interface GattTelemetryPacket {
  sequenceNumber: number;
  temperatureCelsius: number;
  humidityPercent: number;
  batteryVoltageVolts: number;
  pressureHpa: number;
  crcValid: boolean;
  timestampMs: number;
}

/**
 * Simulates decoding a binary GATT packet payload buffer from an environmental IoT peripheral.
 */
export function decodeGattPayload(
  rawHex: string,
  sequenceNum: number = 1042
): GattTelemetryPacket {
  // Mock robust parser for 8-byte IoT sensor characteristic
  // Bytes 0-1: Temp in 0.01 C (e.g. 2450 -> 24.5 C)
  // Bytes 2-3: Humidity in 0.01 % (e.g. 5820 -> 58.2 %)
  // Bytes 4-5: Voltage in mV (e.g. 3280 -> 3.28 V)
  // Bytes 6-7: Pressure offset (1013.25 standard)
  const temp = 24.5 + ((sequenceNum % 10) * 0.1);
  const humidity = 58.2 + ((sequenceNum % 5) * 0.2);
  const voltage = 3.28 - ((sequenceNum % 20) * 0.005);
  const pressure = 1013.2 + ((sequenceNum % 8) * 0.05);

  return {
    sequenceNumber: sequenceNum,
    temperatureCelsius: Math.round(temp * 10) / 10,
    humidityPercent: Math.round(humidity * 10) / 10,
    batteryVoltageVolts: Math.round(voltage * 100) / 100,
    pressureHpa: Math.round(pressure * 10) / 10,
    crcValid: true,
    timestampMs: Date.now(),
  };
}
