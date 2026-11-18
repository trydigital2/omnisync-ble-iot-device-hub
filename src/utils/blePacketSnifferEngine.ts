export type HciPacketType = 'HCI_COMMAND' | 'HCI_ACL_DATA' | 'HCI_EVENT';

export interface DecodedAdElement {
  typeHex: string;
  typeName: string;
  length: number;
  dataHex: string;
}

export interface SniffedBlePacket {
  packetIndex: number;
  packetType: HciPacketType;
  channelIndex: 37 | 38 | 39; // BLE advertising primary channels
  timestampDeltaMs: number;
  rawPayloadHex: string;
  rssiDbm: number;
  advAddress: string;
  adElements: DecodedAdElement[];
  isCrcValid: boolean;
}

export interface SnifferMetrics {
  totalPacketsCaptured: number;
  packetsPerSecond: number;
  droppedPacketsCount: number;
  frameErrorRatePercent: number;
  activeAdvChannels: number[];
}

/**
 * Parses raw BLE advertising PDU byte stream into structured LTV (Length-Type-Value) AD elements.
 */
export function decodeAdElementsFromHex(payloadHex: string): DecodedAdElement[] {
  const elements: DecodedAdElement[] = [];
  let cursor = 0;
  const hex = payloadHex.replace(/\s+/g, '');

  while (cursor < hex.length) {
    if (cursor + 2 > hex.length) break;
    const length = parseInt(hex.substring(cursor, cursor + 2), 16);
    if (length === 0 || cursor + 2 + length * 2 > hex.length) break;

    const typeHex = hex.substring(cursor + 2, cursor + 4).toUpperCase();
    const dataHex = hex.substring(cursor + 4, cursor + 2 + length * 2);

    let typeName = 'Unknown AD';
    switch (typeHex) {
      case '01':
        typeName = 'Flags';
        break;
      case '02':
      case '03':
        typeName = '16-bit Service UUIDs';
        break;
      case '08':
      case '09':
        typeName = 'Complete Local Name';
        break;
      case '0A':
        typeName = 'Tx Power Level';
        break;
      case '16':
        typeName = 'Service Data (16-bit)';
        break;
      case 'FF':
        typeName = 'Manufacturer Specific Data';
        break;
    }

    elements.push({
      typeHex: `0x${typeHex}`,
      typeName,
      length,
      dataHex,
    });

    cursor += 2 + length * 2;
  }

  return elements;
}

export function getSampleSniffedPackets(): SniffedBlePacket[] {
  return [
    {
      packetIndex: 1042,
      packetType: 'HCI_EVENT',
      channelIndex: 37,
      timestampDeltaMs: 12.4,
      rawPayloadHex: '0201060303E1FF0B094F6D6E6953796E63',
      rssiDbm: -56,
      advAddress: 'A4:C1:38:F2:99:12',
      adElements: decodeAdElementsFromHex('0201060303E1FF0B094F6D6E6953796E63'),
      isCrcValid: true,
    },
    {
      packetIndex: 1043,
      packetType: 'HCI_ACL_DATA',
      channelIndex: 38,
      timestampDeltaMs: 28.1,
      rawPayloadHex: '0516AAFE10EE000A12',
      rssiDbm: -68,
      advAddress: 'DC:A6:32:78:E1:90',
      adElements: decodeAdElementsFromHex('0516AAFE10EE000A12'),
      isCrcValid: true,
    },
  ];
}
