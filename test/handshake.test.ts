import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ChangeCipherSpec } from '../src/messages/record/change_cipher_spec'
import { Certificate } from '../src/messages/record/handshake/certificate'
import { CertificateVerify } from '../src/messages/record/handshake/certificate_verify'
import { ClientHello } from '../src/messages/record/handshake/client_hello'
import { EncryptedExtensions } from '../src/messages/record/handshake/encrypted_extensions'
import { Finished } from '../src/messages/record/handshake/finished'
import { Handshake } from '../src/messages/record/handshake/handshake'
import { ServerHello } from '../src/messages/record/handshake/server_hello'
import { TLSPlaintext } from '../src/messages/record/record'
import { ContentType, HandshakeType } from '../src/protocol/constants'

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

describe('Handshake Parsing', () => {
  it('should parse ClientHello from fixture', () => {
    const fixturePath = join(__dirname, '../tls13/e2e/handshake/client_hello.json')
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
    const rawData = hexToUint8Array(fixture.raw_hex)

    // 1. Parse Record
    const record = TLSPlaintext.parse(rawData)
    expect(record.type).toBe(ContentType.Handshake)

    // 2. Parse Handshake
    const handshake = Handshake.parse(record.payload)
    expect(handshake.handshakeType).toBe(HandshakeType.ClientHello)

    // 3. Parse ClientHello
    const ch = ClientHello.unmarshal(handshake.body)

    expect(ch.protocolVersion).toBe(0x0303) // TLS 1.2 for compatibility
    expect(Buffer.from(ch.random).toString('hex')).toBe(fixture.handshake.random)
    expect(ch.legacySessionId.length).toBe(0)
    expect(ch.cipherSuites).toContain(0x1301) // TLS_AES_128_GCM_SHA256
    expect(ch.legacyCompressionMethods).toEqual(new Uint8Array([0x00]))

    // Extensions
    expect(ch.extensions.length).toBe(fixture.handshake.extensions.length)
  })

  it('should parse full handshake trace', () => {
    const fixturePath = join(__dirname, '../tls13/e2e/handshake/handshake_trace.json')
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))

    for (const recordFixture of fixture.records) {
      const wire = hexToUint8Array(recordFixture.wire_record)
      const record = TLSPlaintext.parse(wire)

      const decryptedPayload = hexToUint8Array(recordFixture.decrypted_payload)

      if (record.type === ContentType.Handshake) {
        let offset = 0
        while (offset < decryptedPayload.length) {
          const hs = Handshake.parse(decryptedPayload.slice(offset))
          offset += 4 + hs.length

          switch (hs.handshakeType) {
            case HandshakeType.ClientHello:
              ClientHello.unmarshal(hs.body)
              break
            case HandshakeType.ServerHello:
              ServerHello.parse(hs.marshal())
              break
            case HandshakeType.EncryptedExtensions:
              EncryptedExtensions.parse(hs.marshal())
              break
            case HandshakeType.Certificate:
              Certificate.parse(hs.marshal())
              break
            case HandshakeType.CertificateVerify:
              CertificateVerify.parse(hs.marshal())
              break
            case HandshakeType.Finished:
              Finished.parse(hs.marshal())
              break
          }
        }
      } else if (record.type === ContentType.ChangeCipherSpec) {
        ChangeCipherSpec.parse(decryptedPayload)
      }
    }
  })
})
