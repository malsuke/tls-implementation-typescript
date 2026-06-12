import { ExtensionType, HandshakeType, type SignatureScheme } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { Extension } from './extensions/extension'
import { SignatureAlgorithms } from './extensions/signature_algorithms'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class CertificateRequest {
  constructor(
    public supportedSignatureAlgorithms: SignatureScheme[],
    public supportedSignatureAlgorithmsCert: SignatureScheme[],
    public certificateAuthorities: Uint8Array[]
  ) {}

  public static parse(data: Uint8Array): CertificateRequest {
    const body = stripHandshakeHeader(data, HandshakeType.CertificateRequest)
    const reader = new Reader(body)

    const context = reader.readUint8LengthPrefixed()
    if (context.length !== 0) {
      throw new Error('invalid certificate request context')
    }

    const extData = reader.readUint16LengthPrefixed()
    if (!reader.isEmpty) {
      throw new Error('failed to read certificate request extensions')
    }

    const exts = Extension.unmarshalExtensions(extData)

    let supportedSignatureAlgorithms: SignatureScheme[] = []
    let supportedSignatureAlgorithmsCert: SignatureScheme[] = []
    const certificateAuthorities: Uint8Array[] = []

    for (const ext of exts) {
      switch (ext.type) {
        case ExtensionType.SignatureAlgorithms: {
          const sa = SignatureAlgorithms.unmarshal(ext.payload)
          supportedSignatureAlgorithms = sa.algorithms
          break
        }
        case ExtensionType.SignatureAlgorithmsCert: {
          const sa = SignatureAlgorithms.unmarshal(ext.payload)
          supportedSignatureAlgorithmsCert = sa.algorithms
          break
        }
        case ExtensionType.CertificateAuthorities: {
          const caReader = new Reader(ext.payload)
          const caListBytes = caReader.readUint16LengthPrefixed()
          if (!caReader.isEmpty || caListBytes.length === 0) {
            throw new Error('failed to parse certificate_authorities extension')
          }
          const listReader = new Reader(caListBytes)
          while (!listReader.isEmpty) {
            const ca = listReader.readUint16LengthPrefixed()
            if (ca.length === 0) {
              throw new Error('failed to parse certificate_authorities extension')
            }
            certificateAuthorities.push(new Uint8Array(ca))
          }
          break
        }
      }
    }

    return new CertificateRequest(
      supportedSignatureAlgorithms,
      supportedSignatureAlgorithmsCert,
      certificateAuthorities
    )
  }
}
