import { HandshakeType, type SignatureScheme } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class CertificateVerify {
  constructor(
    public signatureAlgorithm: SignatureScheme,
    public signature: Uint8Array
  ) {}

  public static parse(data: Uint8Array): CertificateVerify {
    const body = stripHandshakeHeader(data, HandshakeType.CertificateVerify)
    const reader = new Reader(body)

    const sigAlg = reader.readUint16() as SignatureScheme
    const signature = reader.readUint16LengthPrefixed()

    if (!reader.isEmpty) {
      throw new Error('failed to read signature')
    }

    return new CertificateVerify(sigAlg, new Uint8Array(signature))
  }
}
