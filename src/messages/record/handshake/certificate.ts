import { HandshakeType } from '../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readUint8LengthPrefixed,
  readUint16LengthPrefixed,
  readUint24LengthPrefixed,
} from '../../../utils/reader'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface Certificate {
  certificates: Uint8Array[]
}

export const unmarshalCertificate = (data: Uint8Array): Certificate => {
  const body = stripHandshakeHeader(data, HandshakeType.Certificate)
  const reader = createReader(body)

  const context = readUint8LengthPrefixed(reader)
  if (context.length !== 0) {
    throw new Error('invalid certificate context')
  }

  const certList = readUint24LengthPrefixed(reader)
  if (!isEmpty(reader)) {
    throw new Error('failed to read certificate list')
  }

  const listReader = createReader(certList)
  const certificates: Uint8Array[] = []

  while (!isEmpty(listReader)) {
    const cert = readUint24LengthPrefixed(listReader)
    readUint16LengthPrefixed(listReader)
    certificates.push(new Uint8Array(cert))
  }

  return { certificates }
}
