import { CipherSuite, HandshakeType, TLSVersion } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { Writer } from '../../../utils/writer'
import { Extension } from './extensions/extension'
import type { HandshakeMessage } from './handshake'

const CLIENT_RANDOM_LENGTH = 32

export class ClientHello implements HandshakeMessage {
  constructor(
    public protocolVersion: TLSVersion,
    public random: Uint8Array, // 32 bytes
    public legacySessionId: Uint8Array,
    public cipherSuites: CipherSuite[],
    public legacyCompressionMethods: Uint8Array,
    public extensions: Extension[]
  ) {}

  public type(): HandshakeType {
    return HandshakeType.ClientHello
  }

  public static create(random: Uint8Array, exts: Extension[]): ClientHello {
    if (random.length !== CLIENT_RANDOM_LENGTH) {
      throw new Error(`Random must be ${CLIENT_RANDOM_LENGTH} bytes`)
    }
    return new ClientHello(
      TLSVersion.TLS_1_2,
      random,
      new Uint8Array(0),
      [CipherSuite.TLS_AES_128_GCM_SHA256],
      new Uint8Array([0x00]),
      exts
    )
  }

  public marshal(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16(this.protocolVersion)
    writer.writeBytes(this.random)

    writer.writeUint8LengthPrefixed(w => w.writeBytes(this.legacySessionId))

    writer.writeUint16LengthPrefixed(w => {
      for (const cs of this.cipherSuites) {
        w.writeUint16(cs)
      }
    })

    writer.writeUint8LengthPrefixed(w => w.writeBytes(this.legacyCompressionMethods))

    if (this.extensions.length > 0) {
      writer.writeUint16LengthPrefixed(w => {
        for (const ext of this.extensions) {
          w.writeBytes(ext.marshal())
        }
      })
    }

    return writer.bytes()
  }

  public static unmarshal(data: Uint8Array): ClientHello {
    const reader = new Reader(data)
    const protocolVersion = reader.readUint16() as TLSVersion
    const random = reader.readBytes(CLIENT_RANDOM_LENGTH)
    const legacySessionId = reader.readUint8LengthPrefixed()

    const cipherSuitesData = reader.readUint16LengthPrefixed()
    const csReader = new Reader(cipherSuitesData)
    const cipherSuites: CipherSuite[] = []
    while (!csReader.isEmpty) {
      cipherSuites.push(csReader.readUint16() as CipherSuite)
    }

    const legacyCompressionMethods = reader.readUint8LengthPrefixed()

    let extensions: Extension[] = []
    if (!reader.isEmpty) {
      const extensionsData = reader.readUint16LengthPrefixed()
      extensions = Extension.unmarshalExtensions(extensionsData)
    }

    return new ClientHello(
      protocolVersion,
      random,
      legacySessionId,
      cipherSuites,
      legacyCompressionMethods,
      extensions
    )
  }
}
