import {
  type CipherSuite,
  ExtensionType,
  HandshakeType,
  type TLSVersion,
} from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { Cookie } from './extensions/cookie'
import { Extension } from './extensions/extension'
import { KeyShareExtension } from './extensions/key_share'
import { SupportedVersions } from './extensions/supported_versions'
import type { HandshakeMessage } from './handshake'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class ServerHello implements HandshakeMessage {
  constructor(
    public original: Uint8Array,
    public protocolVersion: TLSVersion,
    public random: Uint8Array, // 32 bytes
    public sessionId: Uint8Array,
    public cipherSuite: CipherSuite,
    public compressionMethod: number,
    public extensions: Extension[]
  ) {}

  public type(): HandshakeType {
    return HandshakeType.ServerHello
  }

  public marshal(): Uint8Array {
    throw new Error('ServerHello marshal not fully implemented for writing')
  }

  public static parse(data: Uint8Array): ServerHello {
    const original = new Uint8Array(data)
    const body = stripHandshakeHeader(data, HandshakeType.ServerHello)
    const reader = new Reader(body)

    const protocolVersion = reader.readUint16() as TLSVersion
    const random = reader.readBytes(32)
    const sessionId = reader.readUint8LengthPrefixed()
    const cipherSuite = reader.readUint16() as CipherSuite
    const compressionMethod = reader.readUint8()

    let extensions: Extension[] = []
    if (!reader.isEmpty) {
      const extData = reader.readUint16LengthPrefixed()
      if (!reader.isEmpty) {
        throw new Error('failed to read ServerHello extensions')
      }
      extensions = Extension.unmarshalExtensions(extData)
    }

    const seenExts = new Set<ExtensionType>()
    for (const ext of extensions) {
      if (seenExts.has(ext.type)) {
        throw new Error(`duplicate extension: ${ext.type}`)
      }
      seenExts.add(ext.type)

      switch (ext.type) {
        case ExtensionType.SupportedVersions:
          SupportedVersions.unmarshalServer(ext.payload)
          break
        case ExtensionType.Cookie:
          Cookie.unmarshal(ext.payload)
          break
        case ExtensionType.KeyShare:
          KeyShareExtension.unmarshalServer(ext.payload)
          break
      }
    }

    return new ServerHello(
      original,
      protocolVersion,
      random,
      sessionId,
      cipherSuite,
      compressionMethod,
      extensions
    )
  }
}
