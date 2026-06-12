import type { HandshakeType } from '../../../protocol/constants'

export const HANDSHAKE_HEADER_LEN = 4

export function stripHandshakeHeader(data: Uint8Array, expected: HandshakeType): Uint8Array {
  if (data.length >= HANDSHAKE_HEADER_LEN && data[0] === expected) {
    return data.slice(HANDSHAKE_HEADER_LEN)
  }
  return data
}
