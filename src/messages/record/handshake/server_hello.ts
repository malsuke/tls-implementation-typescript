import {
  type CipherSuite,
  ExtensionType,
  HandshakeType,
  type TLSVersion,
} from '../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readBytes,
  readUint8,
  readUint8LengthPrefixed,
  readUint16,
  readUint16LengthPrefixed,
} from '../../../utils/reader'
import { unmarshalCookie } from './extensions/cookie'
import { type Extension, parseExtensions } from './extensions/extension'
import { unmarshalKeyShareServer } from './extensions/key_share'
import { unmarshalSupportedVersionsServer } from './extensions/supported_versions'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface ServerHello {
  original: Uint8Array
  protocolVersion: TLSVersion
  random: Uint8Array // 32 bytes
  sessionId: Uint8Array
  cipherSuite: CipherSuite
  compressionMethod: number
  extensions: Extension[]
}

export const marshalServerHello = (_sh: ServerHello): Uint8Array => {
  throw new Error('ServerHello marshal not fully implemented for writing')
}

export const unmarshalServerHello = (data: Uint8Array): ServerHello => {
  const original = new Uint8Array(data)
  const body = stripHandshakeHeader(data, HandshakeType.ServerHello)
  const reader = createReader(body)

  const protocolVersion = readUint16(reader) as TLSVersion
  const random = readBytes(reader, 32)
  const sessionId = readUint8LengthPrefixed(reader)
  const cipherSuite = readUint16(reader) as CipherSuite
  const compressionMethod = readUint8(reader)

  let extensions: Extension[] = []
  if (!isEmpty(reader)) {
    const extData = readUint16LengthPrefixed(reader)
    if (!isEmpty(reader)) {
      throw new Error('failed to read ServerHello extensions')
    }
    extensions = parseExtensions(extData)
  }

  const seenExts = new Set<ExtensionType>()
  for (const ext of extensions) {
    if (seenExts.has(ext.type)) {
      throw new Error(`duplicate extension: ${ext.type}`)
    }
    seenExts.add(ext.type)

    switch (ext.type) {
      case ExtensionType.SupportedVersions:
        unmarshalSupportedVersionsServer(ext.payload)
        break
      case ExtensionType.Cookie:
        unmarshalCookie(ext.payload)
        break
      case ExtensionType.KeyShare:
        unmarshalKeyShareServer(ext.payload)
        break
    }
  }

  return {
    original,
    protocolVersion,
    random,
    sessionId,
    cipherSuite,
    compressionMethod,
    extensions,
  }
}
