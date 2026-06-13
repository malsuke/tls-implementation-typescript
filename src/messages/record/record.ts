import { type ContentType, TLSVersion } from '../../protocol/constants'
import { createReader, getUnreadBytes, readBytes, readUint8, readUint16 } from '../../utils/reader'
import { createWriter, getBytes, writeBytes, writeUint8, writeUint16 } from '../../utils/writer'

export const MAX_PAYLOAD_LEN = 16384 // 2^14
export const RECORD_HEADER_LEN = 5

export interface TLSPlaintext {
  type: ContentType
  version: TLSVersion
  length: number
  payload: Uint8Array
}

export const createTLSPlaintext = (
  contentType: ContentType,
  fragment: Uint8Array
): TLSPlaintext => {
  if (fragment.length > MAX_PAYLOAD_LEN) {
    throw new Error('tls: payload too large')
  }
  return {
    type: contentType,
    version: TLSVersion.TLS_1_2, // TLS 1.3 uses 0x0303 for compatibility
    length: fragment.length,
    payload: fragment,
  }
}

export const marshalTLSPlaintext = (record: TLSPlaintext): Uint8Array => {
  const writer = createWriter()
  writeUint8(writer, record.type)
  writeUint16(writer, record.version)
  writeUint16(writer, record.length)
  writeBytes(writer, record.payload)
  return getBytes(writer)
}

export const getTLSPlaintextHeader = (record: TLSPlaintext): Uint8Array => {
  const writer = createWriter()
  writeUint8(writer, record.type)
  writeUint16(writer, record.version)
  writeUint16(writer, record.length)
  return getBytes(writer)
}

export const parseTLSPlaintext = (data: Uint8Array): TLSPlaintext => {
  const reader = createReader(data)
  const type = readUint8(reader) as ContentType
  const version = readUint16(reader) as TLSVersion
  const length = readUint16(reader)

  if (getUnreadBytes(reader) < length) {
    throw new Error('tls: data length mismatch')
  }
  const payload = readBytes(reader, length)

  return { type, version, length, payload }
}

export const parseTLSPlaintextHeader = (
  data: Uint8Array
): Pick<TLSPlaintext, 'type' | 'version' | 'length'> => {
  if (data.length < RECORD_HEADER_LEN) {
    throw new Error('tls: data too short')
  }
  const reader = createReader(data.slice(0, RECORD_HEADER_LEN))
  const type = readUint8(reader) as ContentType
  const version = readUint16(reader) as TLSVersion
  const length = readUint16(reader)
  return { type, version, length }
}

export interface TLSInnerPlaintext {
  content: Uint8Array
  type: ContentType
  padding: Uint8Array
}

export const marshalTLSInnerPlaintext = (record: TLSInnerPlaintext): Uint8Array => {
  const writer = createWriter()
  writeBytes(writer, record.content)
  writeUint8(writer, record.type)
  if (record.padding.length > 0) {
    writeBytes(writer, record.padding)
  }
  return getBytes(writer)
}

export const parseTLSInnerPlaintext = (data: Uint8Array): TLSInnerPlaintext => {
  if (data.length < 1) {
    throw new Error('tls: inner plaintext too short')
  }

  let typeIndex = -1
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i] !== 0) {
      typeIndex = i
      break
    }
  }

  if (typeIndex < 0) {
    throw new Error('tls: inner plaintext missing content type')
  }

  const content = data.slice(0, typeIndex)
  const type = data[typeIndex] as ContentType
  const padding = data.slice(typeIndex + 1)

  return { content, type, padding }
}
