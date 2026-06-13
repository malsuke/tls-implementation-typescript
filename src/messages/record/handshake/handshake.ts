import type { HandshakeType } from '../../../protocol/constants'
import {
  createReader,
  getUnreadBytes,
  readBytes,
  readUint8,
  readUint24,
} from '../../../utils/reader'
import { createWriter, getBytes, writeBytes, writeUint8, writeUint24 } from '../../../utils/writer'

export const MAX_HANDSHAKE_BODY_LEN = 0xffffff

export interface Handshake {
  handshakeType: HandshakeType
  length: number
  body: Uint8Array
}

export const createHandshake = (handshakeType: HandshakeType, body: Uint8Array): Handshake => {
  const len = body.length
  if (len > MAX_HANDSHAKE_BODY_LEN) {
    throw new Error('tls: handshake body too large')
  }
  return { handshakeType, length: len, body }
}

export const marshalHandshake = (handshake: Handshake): Uint8Array => {
  const writer = createWriter()
  writeUint8(writer, handshake.handshakeType)
  writeUint24(writer, handshake.length)
  writeBytes(writer, handshake.body)
  return getBytes(writer)
}

export const parseHandshake = (data: Uint8Array): Handshake => {
  const reader = createReader(data)
  const handshakeType = readUint8(reader) as HandshakeType
  const length = readUint24(reader)
  if (getUnreadBytes(reader) < length) {
    throw new Error('tls: handshake body length mismatch')
  }
  const body = readBytes(reader, length)
  return { handshakeType, length, body }
}
