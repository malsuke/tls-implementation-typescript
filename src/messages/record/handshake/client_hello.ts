import { CipherSuite, TLSVersion } from '../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readBytes,
  readUint8LengthPrefixed,
  readUint16,
  readUint16LengthPrefixed,
} from '../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeBytes,
  writeUint8LengthPrefixed,
  writeUint16,
  writeUint16LengthPrefixed,
} from '../../../utils/writer'
import { type Extension, marshalExtension, parseExtensions } from './extensions/extension'

const CLIENT_RANDOM_LENGTH = 32

export interface ClientHello {
  protocolVersion: TLSVersion
  random: Uint8Array // 32 bytes
  legacySessionId: Uint8Array
  cipherSuites: CipherSuite[]
  legacyCompressionMethods: Uint8Array
  extensions: Extension[]
}

export const createClientHello = (random: Uint8Array, exts: Extension[]): ClientHello => {
  if (random.length !== CLIENT_RANDOM_LENGTH) {
    throw new Error(`Random must be ${CLIENT_RANDOM_LENGTH} bytes`)
  }
  return {
    protocolVersion: TLSVersion.TLS_1_2,
    random,
    legacySessionId: new Uint8Array(0),
    cipherSuites: [CipherSuite.TLS_AES_128_GCM_SHA256],
    legacyCompressionMethods: new Uint8Array([0x00]),
    extensions: exts,
  }
}

export const marshalClientHello = (ch: ClientHello): Uint8Array => {
  const writer = createWriter()
  writeUint16(writer, ch.protocolVersion)
  writeBytes(writer, ch.random)

  writeUint8LengthPrefixed(writer, w => writeBytes(w, ch.legacySessionId))

  writeUint16LengthPrefixed(writer, w => {
    for (const cs of ch.cipherSuites) {
      writeUint16(w, cs)
    }
  })

  writeUint8LengthPrefixed(writer, w => writeBytes(w, ch.legacyCompressionMethods))

  if (ch.extensions.length > 0) {
    writeUint16LengthPrefixed(writer, w => {
      for (const ext of ch.extensions) {
        writeBytes(w, marshalExtension(ext))
      }
    })
  }

  return getBytes(writer)
}

export const unmarshalClientHello = (data: Uint8Array): ClientHello => {
  const reader = createReader(data)
  const protocolVersion = readUint16(reader) as TLSVersion
  const random = readBytes(reader, CLIENT_RANDOM_LENGTH)
  const legacySessionId = readUint8LengthPrefixed(reader)

  const cipherSuitesData = readUint16LengthPrefixed(reader)
  const csReader = createReader(cipherSuitesData)
  const cipherSuites: CipherSuite[] = []
  while (!isEmpty(csReader)) {
    cipherSuites.push(readUint16(csReader) as CipherSuite)
  }

  const legacyCompressionMethods = readUint8LengthPrefixed(reader)

  let extensions: Extension[] = []
  if (!isEmpty(reader)) {
    const extensionsData = readUint16LengthPrefixed(reader)
    extensions = parseExtensions(extensionsData)
  }

  return {
    protocolVersion,
    random,
    legacySessionId,
    cipherSuites,
    legacyCompressionMethods,
    extensions,
  }
}
