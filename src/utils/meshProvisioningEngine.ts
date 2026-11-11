export type MeshProvisioningState =
  | 'UNPROVISIONED'
  | 'INVITATION_SENT'
  | 'PUBLIC_KEY_EXCHANGED'
  | 'AUTHENTICATING'
  | 'DATA_PROVISIONED'
  | 'RELAY_ACTIVE';

export interface MeshNodeProfile {
  deviceUuid: string;
  deviceMac: string;
  nodeName: string;
  assignedUnicastAddressHex: string;
  provisioningState: MeshProvisioningState;
  networkKeyIndex: number;
  appKeyIndex: number;
  relayTtlMaxHops: number;
  isRelaySupported: boolean;
  isProxySupported: boolean;
  networkHealthScore: number;
}

/**
 * Calculates deterministic mesh unicast address based on sequential node ID.
 * Addresses range from 0x0001 to 0x7FFF (RFC SIG Mesh Profile).
 */
export function allocateUnicastAddress(sequenceId: number): string {
  const addressNum = (sequenceId % 0x7fff) + 1;
  return `0x${addressNum.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * Evaluates mesh node provisioning parameters, security key indices, and network relay limits.
 */
export function evaluateMeshProvisioning(
  deviceUuid: string = 'A8:05:41:9C:20:11',
  sequenceId: number = 42,
  state: MeshProvisioningState = 'RELAY_ACTIVE'
): MeshNodeProfile {
  const unicastHex = allocateUnicastAddress(sequenceId);

  // Mesh TTL hop calculation: Default 4 hops, max relay propagation
  const relayTtlMaxHops = 4;

  // Network health score based on state
  let healthScore = 20;
  if (state === 'PUBLIC_KEY_EXCHANGED') healthScore = 50;
  else if (state === 'DATA_PROVISIONED') healthScore = 85;
  else if (state === 'RELAY_ACTIVE') healthScore = 98;

  return {
    deviceUuid,
    deviceMac: 'F0:8A:76:CD:41:99',
    nodeName: 'Smart Luminaire Relay Node-04',
    assignedUnicastAddressHex: unicastHex,
    provisioningState: state,
    networkKeyIndex: 0, // NetKey 0 (Primary Subnet)
    appKeyIndex: 1, // AppKey 1 (Lighting & Telemetry Model)
    relayTtlMaxHops,
    isRelaySupported: true,
    isProxySupported: true,
    networkHealthScore: healthScore,
  };
}
