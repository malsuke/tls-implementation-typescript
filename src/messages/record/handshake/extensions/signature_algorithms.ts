import { ExtensionType, SignatureScheme } from '../../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readUint16,
  readUint16LengthPrefixed,
} from '../../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeUint16,
  writeUint16LengthPrefixed,
} from '../../../../utils/writer'
import { createExtension, type Extension } from './extension'

export interface SignatureAlgorithms {
  algorithms: SignatureScheme[]
}

export const marshalSignatureAlgorithmsPayload = (sa: SignatureAlgorithms): Uint8Array => {
  const writer = createWriter()
  writeUint16LengthPrefixed(writer, w => {
    for (const alg of sa.algorithms) {
      writeUint16(w, alg)
    }
  })
  return getBytes(writer)
}

export const unmarshalSignatureAlgorithms = (payload: Uint8Array): SignatureAlgorithms => {
  const reader = createReader(payload)
  const sigList = readUint16LengthPrefixed(reader)

  if (sigList.length === 0 || sigList.length % 2 !== 0) {
    throw new Error('failed to parse signature algorithms')
  }

  const listReader = createReader(sigList)
  const algorithms: SignatureScheme[] = []
  while (!isEmpty(listReader)) {
    algorithms.push(readUint16(listReader) as SignatureScheme)
  }

  return { algorithms }
}

export const createSignatureAlgorithmsExtension = (
  algorithms: SignatureScheme[] = [
    SignatureScheme.ECDSA_SECP256R1_SHA256,
    SignatureScheme.RSA_PSS_RSAE_SHA256,
    SignatureScheme.RSA_PKCS1_SHA256,
    SignatureScheme.ED25519,
  ]
): Extension => {
  const sa: SignatureAlgorithms = { algorithms }
  return createExtension(ExtensionType.SignatureAlgorithms, marshalSignatureAlgorithmsPayload(sa))
}
