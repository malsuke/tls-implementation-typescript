import { ExtensionType, SignatureScheme } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import { Extension, type ExtensionData } from './extension'

export class SignatureAlgorithms implements ExtensionData {
  constructor(public algorithms: SignatureScheme[]) {}

  public type(): ExtensionType {
    return ExtensionType.SignatureAlgorithms
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16LengthPrefixed(w => {
      for (const alg of this.algorithms) {
        w.writeUint16(alg)
      }
    })
    return writer.bytes()
  }

  public static unmarshal(payload: Uint8Array): SignatureAlgorithms {
    const reader = new Reader(payload)
    const sigList = reader.readUint16LengthPrefixed()

    if (sigList.length === 0 || sigList.length % 2 !== 0) {
      throw new Error('failed to parse signature algorithms')
    }

    const listReader = new Reader(sigList)
    const algorithms: SignatureScheme[] = []
    while (!listReader.isEmpty) {
      algorithms.push(listReader.readUint16() as SignatureScheme)
    }

    return new SignatureAlgorithms(algorithms)
  }

  public static createExtension(): Extension {
    return Extension.create(
      new SignatureAlgorithms([
        SignatureScheme.ECDSA_SECP256R1_SHA256,
        SignatureScheme.RSA_PSS_RSAE_SHA256,
        SignatureScheme.RSA_PKCS1_SHA256,
        SignatureScheme.ED25519,
      ])
    )
  }
}
