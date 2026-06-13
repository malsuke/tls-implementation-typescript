import { ExtensionType, HandshakeType, type SignatureScheme } from '../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readUint8LengthPrefixed,
  readUint16LengthPrefixed,
} from '../../../utils/reader'
import { parseExtensions } from './extensions/extension'
import { unmarshalSignatureAlgorithms } from './extensions/signature_algorithms'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface CertificateRequest {
  supportedSignatureAlgorithms: SignatureScheme[]
  supportedSignatureAlgorithmsCert: SignatureScheme[]
  certificateAuthorities: Uint8Array[]
}

export const parseCertificateRequest = (data: Uint8Array): CertificateRequest => {
  const body = stripHandshakeHeader(data, HandshakeType.CertificateRequest)
  const reader = createReader(body)

  const context = readUint8LengthPrefixed(reader)
  if (context.length !== 0) {
    throw new Error('invalid certificate request context')
  }

  const extData = readUint16LengthPrefixed(reader)
  if (!isEmpty(reader)) {
    throw new Error('failed to read certificate request extensions')
  }

  const exts = parseExtensions(extData)

  let supportedSignatureAlgorithms: SignatureScheme[] = []
  let supportedSignatureAlgorithmsCert: SignatureScheme[] = []
  const certificateAuthorities: Uint8Array[] = []

  for (const ext of exts) {
    switch (ext.type) {
      case ExtensionType.SignatureAlgorithms: {
        const sa = unmarshalSignatureAlgorithms(ext.payload)
        supportedSignatureAlgorithms = sa.algorithms
        break
      }
      case ExtensionType.SignatureAlgorithmsCert: {
        const sa = unmarshalSignatureAlgorithms(ext.payload)
        supportedSignatureAlgorithmsCert = sa.algorithms
        break
      }
      case ExtensionType.CertificateAuthorities: {
        const caReader = createReader(ext.payload)
        const caListBytes = readUint16LengthPrefixed(caReader)
        if (!isEmpty(caReader) || caListBytes.length === 0) {
          throw new Error('failed to parse certificate_authorities extension')
        }
        const listReader = createReader(caListBytes)
        while (!isEmpty(listReader)) {
          const ca = readUint16LengthPrefixed(listReader)
          if (ca.length === 0) {
            throw new Error('failed to parse certificate_authorities extension')
          }
          certificateAuthorities.push(new Uint8Array(ca))
        }
        break
      }
    }
  }

  return {
    supportedSignatureAlgorithms,
    supportedSignatureAlgorithmsCert,
    certificateAuthorities,
  }
}
