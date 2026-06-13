import { HandshakeType, type SignatureScheme } from '../../../protocol/constants'
import { createReader, isEmpty, readUint16, readUint16LengthPrefixed } from '../../../utils/reader'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface CertificateVerify {
  signatureAlgorithm: SignatureScheme
  signature: Uint8Array
}

export const unmarshalCertificateVerify = (data: Uint8Array): CertificateVerify => {
  const body = stripHandshakeHeader(data, HandshakeType.CertificateVerify)
  const reader = createReader(body)

  const signatureAlgorithm = readUint16(reader) as SignatureScheme
  const signature = readUint16LengthPrefixed(reader)

  if (!isEmpty(reader)) {
    throw new Error('failed to read signature')
  }

  return { signatureAlgorithm, signature: new Uint8Array(signature) }
}
