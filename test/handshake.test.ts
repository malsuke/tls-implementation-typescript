import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseChangeCipherSpec } from '../src/messages/record/change_cipher_spec'
import { unmarshalCertificate } from '../src/messages/record/handshake/certificate'
import { unmarshalCertificateVerify } from '../src/messages/record/handshake/certificate_verify'
import { unmarshalClientHello } from '../src/messages/record/handshake/client_hello'
import { unmarshalEncryptedExtensions } from '../src/messages/record/handshake/encrypted_extensions'
import { unmarshalFinished } from '../src/messages/record/handshake/finished'
import { marshalHandshake, parseHandshake } from '../src/messages/record/handshake/handshake'
import { unmarshalServerHello } from '../src/messages/record/handshake/server_hello'
import { parseTLSPlaintext } from '../src/messages/record/record'
import { ContentType, HandshakeType } from '../src/protocol/constants'

const hexToUint8Array = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

describe('Handshake Parsing', () => {
  it('should parse ClientHello from fixture', () => {
    try {
      const fixturePath = join(__dirname, '../tls13/e2e/handshake/client_hello.json')
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
      const rawData = hexToUint8Array(fixture.raw_hex)

      // 1. Parse Record
      const record = parseTLSPlaintext(rawData)
      expect(record.type).toBe(ContentType.Handshake)

      // 2. Parse Handshake
      const handshake = parseHandshake(record.payload)
      expect(handshake.handshakeType).toBe(HandshakeType.ClientHello)

      // 3. Parse ClientHello
      const ch = unmarshalClientHello(handshake.body)

      expect(ch.protocolVersion).toBe(0x0303) // TLS 1.2 for compatibility
      expect(Buffer.from(ch.random).toString('hex')).toBe(fixture.handshake.random)
      expect(ch.legacySessionId.length).toBe(0)
      expect(ch.cipherSuites).toContain(0x1301) // TLS_AES_128_GCM_SHA256
      expect(ch.legacyCompressionMethods).toEqual(new Uint8Array([0x00]))

      // Extensions
      expect(ch.extensions.length).toBe(fixture.handshake.extensions.length)
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
        console.warn('Skipping test due to missing fixture')
        return
      }
      throw e
    }
  })

  it('should parse full handshake trace', () => {
    try {
      const fixturePath = join(__dirname, '../tls13/e2e/handshake/handshake_trace.json')
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))

      for (const recordFixture of fixture.records) {
        const wire = hexToUint8Array(recordFixture.wire_record)
        const record = parseTLSPlaintext(wire)

        const decryptedPayload = hexToUint8Array(recordFixture.decrypted_payload)

        if (record.type === ContentType.Handshake) {
          let offset = 0
          while (offset < decryptedPayload.length) {
            const hs = parseHandshake(decryptedPayload.slice(offset))
            offset += 4 + hs.length

            switch (hs.handshakeType) {
              case HandshakeType.ClientHello:
                unmarshalClientHello(hs.body)
                break
              case HandshakeType.ServerHello:
                unmarshalServerHello(marshalHandshake(hs))
                break
              case HandshakeType.EncryptedExtensions:
                unmarshalEncryptedExtensions(marshalHandshake(hs))
                break
              case HandshakeType.Certificate:
                unmarshalCertificate(marshalHandshake(hs))
                break
              case HandshakeType.CertificateVerify:
                unmarshalCertificateVerify(marshalHandshake(hs))
                break
              case HandshakeType.Finished:
                unmarshalFinished(marshalHandshake(hs))
                break
            }
          }
        } else if (record.type === ContentType.ChangeCipherSpec) {
          parseChangeCipherSpec(decryptedPayload)
        }
      }
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
        console.warn('Skipping test due to missing fixture')
        return
      }
      throw e
    }
  })
})
